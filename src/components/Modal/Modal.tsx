import { FC, useEffect } from 'react';
import classes from './styles.module.scss';
import { Form } from '../Form';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onPostCreated?: (newPost: any) => void;
}

const Modal: FC<Props> = ({ isVisible, onClose, onPostCreated }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isVisible]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  return (
    <div className={`${classes.modal} ${isVisible ? classes.visible : classes.hidden}`}>
      <div className={classes.overlay} onClick={onClose}></div>
      <div className={classes.content}>
        <Form onClose={onClose} onPostCreated={onPostCreated} />
      </div>
    </div>
  );
};

export default Modal;
