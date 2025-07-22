import './styles.css';

const Header = () => {
    return (
        <div className="header">
            <div className="form">
                <button className="search">Search</button>
                <input className="input" type="text"/>
            </div>
        </div>
    )
}

export default Header;