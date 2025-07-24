import './styles.css';
import { AddIcon } from "../../assets/svg";

type Props = {
    onAddClick: () => void;
};

const Header = ({ onAddClick }: Props) => {
    return (
        <div className="header">
            <button className="add" onClick={onAddClick}>
                <AddIcon/>
            </button>
            <div className="form">
                <input className="input" type="text" placeholder="search"/>
            </div>
        </div>
    )
}

export default Header;