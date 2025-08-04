import classes from './styles.module.scss';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  id: string;
  title: string;
  src: string;
  description?: string;
}

const ImageItem: FC<Props> = ({ id, title, src, description }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/post', { state: { id, title, src, description } });
  };

  return (
    <div className={classes.imageItem} onClick={handleClick}>
      <h2>{title}</h2>
      <img src={src} alt={title} />
      <p>{description}</p>
    </div>
  );
};

export default ImageItem;
