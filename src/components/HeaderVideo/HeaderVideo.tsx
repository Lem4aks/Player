import classes from './styles.module.scss';
import { FC } from 'react';

interface Props {
  title: string;
}

const HeaderVideo: FC<Props> = ({ title }) => {
  return (
    <div className={classes.headervideo}>
      <h2>{title}</h2>
    </div>
  );
};

export default HeaderVideo;
