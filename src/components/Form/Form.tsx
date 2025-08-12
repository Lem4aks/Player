import classes from './styles.module.scss';
import { CloseIcon, SaveIcon } from '../../assets/svg';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '../Input';
import { postApi } from '../../api';
import { Select } from '../Select';

interface Props {
  onClose: () => void;
  onPostCreated?: (newPost: any) => void;
}

interface IFormInput {
  src?: string;
  title: string;
  type: 'video' | 'image' | 'text';
  description: string;
  content?: string;
}

const postTypes = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'text', label: 'Text' },
];

const Form: FC<Props> = ({ onClose, onPostCreated }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm<IFormInput>({
    mode: 'onBlur',
    defaultValues: {
      type: 'video'
    }
  });

  const srcValue = watch('src');
  const titleValue = watch('title');
  const typeValue = watch('type');

  const onSubmit: SubmitHandler<IFormInput> = async data => {
    try {
      const response = await postApi.createPost({
        title: data.title,
        type: data.type,
        description: data.type === 'text' ? (data.content || '') : (data.description || ''),
        src: data.src || '',
        content: data.type === 'text' ? (data.content || '') : undefined,
      });

      reset();
      onClose();
      
      onPostCreated?.(response.post);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const validateUrl = (value: string | undefined) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const validateSrcForType = (type: string, src: string | undefined) => {
    if ((type === 'video' || type === 'image') && !src) {
      return 'Source URL is required for video and image posts';
    }
    return true;
  };

  const validateContentForType = (type: string, content: string | undefined) => {
    if (type === 'text' && !content) {
      return 'Content is required for text posts';
    }
    return true;
  };

  const clearSrc = () => {
    setValue('src', '');
    clearErrors('src');
  };

  const clearTitle = () => {
    setValue('title', '');
    clearErrors('title');
  };

  return (
    <form className={classes.formadd} onSubmit={handleSubmit(onSubmit)}>
      <div className={classes.headform}>
        <h3 className={classes.contenttitle}>Add new post</h3>
        <button type='button' className={classes.closebtn} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className={classes.formgroup}>
        <div className={classes.inputwrapper}>
          <Select
            options={postTypes}
            value={typeValue}
            onChange={(value) => setValue('type', value as 'video' | 'image' | 'text', { shouldValidate: true })}
            placeholder="Select post type"
          />
          {errors.type && <span className={classes.error}>{errors.type.message}</span>}
        </div>

        <div className={classes.inputwrapper}>
          <Input
            id='title'
            type='text'
            placeholder='Title'
            rightIcon={titleValue ? <CloseIcon /> : null}
            onRightIconClick={titleValue ? clearTitle : undefined}
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters long' },
            })}
          />
        </div>

        {typeValue === 'video' || typeValue === 'image' ? (
          <div className={classes.inputwrapper}>
            <Input
              id='src'
              type='text'
              placeholder='Source URL'
              rightIcon={srcValue ? <CloseIcon /> : null}
              onRightIconClick={srcValue ? clearSrc : undefined}
              error={errors.src?.message}
              {...register('src', {
                required: validateSrcForType(typeValue, srcValue),
                validate: validateUrl,
              })}
            />
          </div>
        ) : null}

        {typeValue === 'text' ? (
          <div className={classes.inputwrapper}>
            <textarea
              {...register('content', {
                required: typeValue === 'text' ? 'Content is required' : true,
                minLength: { value: 10, message: 'Content must be at least 10 characters' }
              })}
              placeholder='Content'
              rows={3}
              className={classes.textarea}
            />
            {errors.content && <span className={classes.error}>{errors.content.message}</span>}
          </div>
        ) : null}

        <div className={classes.inputwrapper}>
          <textarea
            {...register('description', {
              required: false,
              minLength: { value: 10, message: 'Description must be at least 10 characters long' },
            })}
            placeholder='Description'
            rows={3}
            className={classes.textarea}
          />
          {errors.description && <span className={classes.error}>{errors.description.message}</span>}
        </div>

        <button type='submit' className={classes.save} disabled={isSubmitting}>
          <SaveIcon />
        </button>
      </div>
    </form>
  );
};

export default Form;
