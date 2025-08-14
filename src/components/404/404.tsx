import classes from './styles.module.scss';

const NotFound = () => {
    return (
        <div className={classes.error}>
            <h1>404 - Page Not Found</h1>
            <h2>The page you are looking for does not exist.</h2>
        </div>
    );
}

export default NotFound;