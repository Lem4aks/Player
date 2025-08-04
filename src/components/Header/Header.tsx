import { FC, useEffect } from 'react';
import classes from './styles.module.scss';
import { AddIcon } from '../../assets/svg';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getProfile, logout } from '../../store/auth';

interface Props {
  onAddClick: () => void;
  searchTerm: string;
  onSearchChange: (query: string) => void;
}

const Header: FC<Props> = ({ onAddClick, searchTerm, onSearchChange }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderAuthSection = () => {
    if (isAuthenticated && user) {
      return (
        <div className={classes.userSection}>
          <div className={classes.avatar}>
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <button className={classes.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={classes.header}>
      <button className={classes.add} onClick={onAddClick}>
        <AddIcon />
      </button>
      <div className={classes.form}>
        <input
          className={classes.input}
          type='text'
          placeholder='Search'
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <div className={classes.rightSection}>{renderAuthSection()}</div>
    </div>
  );
};

export default Header;
