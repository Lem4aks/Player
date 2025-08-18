import classes from './styles.module.scss';
import { CloseIcon, SaveIcon } from '../../assets/svg';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '../Input';
import { Select } from '../Select';
import { useAppDispatch } from '../../hooks/redux';
import { createPost } from '../../store/post';

interface Props {
  onClose: () => void;
  onPostCreated?: (newPost: any) => void;
}

interface IFormInput {
  src?: string;
  title: string;
  type: 'video' | 'image' | 'text';
  description?:string;
  content?: string;
}

const postTypes = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'text', label: 'Text' },
];

const Form: FC<Props> = ({ onClose, onPostCreated }) => {
  const dispatch = useAppDispatch();

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
      const result = await dispatch(createPost({
        title: data.title,
        type: data.type,
        description: data.type === 'text' ? (data.description || '') : undefined,
        src: data.src || '',
        content: data.type === 'text' ? (data.content || '') : undefined,
      })).unwrap();

      reset();
      onClose();

      onPostCreated?.(result);
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

  const validateMediaFormat = (type: string, url: string | undefined) => {
    if (!url) return true;

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();

      if (type === 'video') {
        if (!pathname.endsWith('.mp4')) {
          return 'Video must be in MP4 format';
        }
      } else if (type === 'image') {
        if (!pathname.endsWith('.jpg') && !pathname.endsWith('.jpeg') && !pathname.endsWith('.png')) {
          return 'Image must be in JPEG or PNG format';
        }
      }

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
                    placeholder={`Source URL (${typeValue === 'video' ? '.mp4' : '.jpg, .jpeg, .png'})`}
                    rightIcon={srcValue ? <CloseIcon /> : null}
                    onRightIconClick={srcValue ? clearSrc : undefined}
                    error={errors.src?.message}
                    {...register('src', {
                      required: validateSrcForType(typeValue, srcValue),
                      validate: {
                        validUrl: validateUrl,
                        validFormat: (value) => validateMediaFormat(typeValue, value)
                      }
                    })}
                />
              </div>
          ) : null}

          {typeValue === 'text' ? (
              <div className={classes.inputwrapper}>
            < Input
                {...register('content', {
                  required: typeValue === 'text' ? 'Content is required' : true,
                  minLength: { value: 10, message: 'Content must be at least 10 characters' }
                })}
                placeholder='Content'
                rows={3}
                className={classes.textarea}
            />
              </div>
          ) : null}

          <div className={classes.inputwrapper}>
          <Input
              {...register('description', {
                required: false,
                maxLength: { value: 100, message: 'Description must be at most 100 characters' },
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