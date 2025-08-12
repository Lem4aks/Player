import { ChangeEvent, FC, FormEvent, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import classes from './styles.module.scss';
import { clearError, login } from '../../store/auth';
import { Input } from '../Input';

const Login: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(login(formData)).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Login rejected:', error);
    }
  };

  const handleBack = () => {
    dispatch(clearError());
    navigate(-1);
  };

  return (
    <div className={classes.container}>
      <div className={classes.form}>
        <button className={classes.backBtn} onClick={handleBack}>
          ← Back
        </button>

        <h2>Sign In</h2>

        {error && <div className={classes.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={classes.field}>
            <label>Email:</label>
            <Input
              type='email'
              value={formData.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder='Enter your email'
            />
          </div>

          <div className={classes.field}>
            <label>Password:</label>
            <Input
              type='password'
              value={formData.password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              placeholder='Enter your password'
            />
          </div>

          <button type='submit' className={classes.submitBtn}>
            Sign In
          </button>
        </form>

        <p>
          Don't have an account? <Link to='/register'>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
