import classes from './styles.module.scss';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  id: string;
  title: string;
  content: string;
}

const TextItem: FC<Props> = ({ id, title, content }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/post', { state: { id, title, content } });
  };

  return (
    <div className={classes.textItem} onClick={handleClick}>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
};

export default TextItem;
