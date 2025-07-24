import './styles.css';
import { AddIcon } from "../../assets/svg";
import {FC} from "react";

type Props = {
    onAddClick: () => void;
};

const Header:FC<Props>  = ({ onAddClick }) => {
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