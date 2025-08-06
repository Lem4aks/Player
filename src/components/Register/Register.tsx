import { FC, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import classes from './styles.module.scss';
import { Input } from '../Input';
import { clearError, register } from '../../store/auth';

const Register: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await dispatch(
        register({
          username: formData.username,
          name: formData.name,
          password: formData.password,
          email: formData.email,
        })
      ).unwrap();
      navigate('/');
    } catch {
      // Ошибка
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

        <h2>Register</h2>

        {error && <div className={classes.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={classes.field}>
            <label>Username:</label>
            <Input
              type='text'
              value={formData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              placeholder='Choose a username'
            />
          </div>

          <div className={classes.field}>
            <Input
              type='text'
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              label='Name'
              required
              placeholder='Enter your name'
            />
          </div>

          <div className={classes.field}>
            <Input
              type='email'
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
              label='Email'
              required
              placeholder='Enter your email'
            />
          </div>

          <div className={classes.field}>
            <Input
              type='password'
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, password: e.target.value })
              }
              label='Password'
              required
              placeholder='Create a password'
            />
          </div>

          <div className={classes.field}>
            <Input
              type='password'
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              label='Confirm Password'
              required
              placeholder='Confirm your password'
            />
          </div>

          <button type='submit' className={classes.submitBtn}>Register</button>
        </form>

        <p>
          Already have an account? <Link to='/login'>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
