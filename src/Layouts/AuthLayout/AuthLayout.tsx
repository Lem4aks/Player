import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.scss';

const AuthLayout = () => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
