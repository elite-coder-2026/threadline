import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import { Panel } from '../common/Panel';
import { Button } from '../common/Button';
import { CharCounter } from '../common/CharCounter';
import { Dropdown } from '../common/Dropdown';
import { useCreatePost } from '../../hooks/usePostMutations';
import { useUploadVideo } from '../../hooks/useUploadVideo';
import { POST_TYPE_OPTIONS, URL_FIELD } from '../../lib/postTypes';
import { assertNever } from '../../lib/assertNever';
import type { CreatePostInput } from '../../api/posts.api';
import type { PostType } from '../../types/models';

const MAX = 280;

interface PostComposerProps {
  /** Called after a post is successfully created (e.g. to close a popover). */
  onPosted?: () => void;
}

export const PostComposer = ({ onPosted }: PostComposerProps = {}): JSX.Element => {
  const [postType, setPostType] = useState<PostType>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const create = useCreatePost();
  const upload = useUploadVideo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captionTooLong = text.length > MAX;
  // Video posts are upload-only — no URL field, no YouTube/Vimeo.
  const urlField =
    postType === 'text' || postType === 'video' ? null : URL_FIELD[postType];
  const urlValid = urlField ? urlField.isValid(url.trim()) : true;

  const busy = create.isPending || upload.isPending;
  const invalid =
    captionTooLong ||
    !urlValid ||
    (postType === 'text' && text.trim().length === 0) ||
    (postType === 'video' && url.trim().length === 0);

  const reset = (): void => {
    setText('');
    setUrl('');
    upload.reset();
  };

  // Upload a chosen file, then drop its public URL into the same `url` field the
  // rest of the flow already understands — the post is still a normal video post.
  const handleFile = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const result = await upload.mutateAsync(file);
    setUrl(result.url);
  };

  const buildInput = (): CreatePostInput => {
    const content = text.trim();
    const link = url.trim();
    switch (postType) {
      case 'text':
        return { postType: 'text', content };
      case 'link':
        return { postType: 'link', url: link, content };
      case 'github':
        return { postType: 'github', url: link, content };
      case 'video':
        return { postType: 'video', url: link, content };
      default:
        return assertNever(postType);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (invalid || busy) return;
    await create.mutateAsync(buildInput());
    reset();
    onPosted?.();
  };

  return (
    <Wrap as="form" onSubmit={handleSubmit}>
      <TopRow>
        <Dropdown<PostType>
          label="Post type"
          value={postType}
          options={POST_TYPE_OPTIONS}
          onChange={setPostType}
        />
        <Hint>
          {postType === 'text'
            ? 'Plain text post'
            : postType === 'video'
              ? 'Upload a video file from your device'
              : `${urlField?.label} + optional caption`}
        </Hint>
      </TopRow>

      {urlField && (
        <UrlInput
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={urlField.placeholder}
          aria-label={urlField.label}
          aria-invalid={url.length > 0 && !urlValid}
        />
      )}

      {postType === 'video' && (
        <Upload>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFile}
            disabled={upload.isPending}
            hidden
          />
          <Button
            type="button"
            $variant="subtle"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? 'Uploading…' : 'Upload a video file'}
          </Button>
          {upload.isError && <Error role="alert">{upload.error.message}</Error>}
          {upload.isSuccess && !upload.isPending && <Ok>Uploaded ✓ ready to post</Ok>}
        </Upload>
      )}

      <Field
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={postType === 'text' ? "What's happening?" : 'Add a caption (optional)'}
        rows={postType === 'text' ? 3 : 2}
        aria-label={postType === 'text' ? 'Post text' : 'Caption'}
        aria-invalid={captionTooLong}
      />

      <Row>
        {create.isError && <Error role="alert">{create.error.message}</Error>}
        <Spacer />
        <CharCounter remaining={MAX - text.length} />
        <Button type="submit" $variant="primary" disabled={invalid || busy}>
          {create.isPending ? 'Posting…' : 'Post'}
        </Button>
      </Row>
    </Wrap>
  );
};

const Wrap = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(3)};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
`;

const Hint = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.85em;
`;

const UrlInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space(3)};
  border: ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusSmall};
  font: inherit;
  color: inherit;
  background: ${({ theme }) => theme.color.bg};

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.color.danger};
  }
`;

const Field = styled.textarea`
  width: 100%;
  resize: vertical;
  padding: ${({ theme }) => theme.space(3)};
  border: ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radiusSmall};
  font: inherit;
  color: inherit;
  background: ${({ theme }) => theme.color.bg};

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.color.danger};
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
`;

const Spacer = styled.span`
  flex: 1;
`;

const Upload = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
`;

const Ok = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.85em;
`;

const Error = styled.span`
  color: ${({ theme }) => theme.color.danger};
  font-size: 0.85em;
`;
