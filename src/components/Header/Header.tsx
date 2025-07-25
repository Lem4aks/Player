import './styles.scss';
import { AddIcon } from "../../assets/svg";
import {FC} from "react";

interface Props{
    onAddClick: () => void;
    searchTerm: string;
    onSearchChange: (query: string) => void;
};

const Header: FC<Props>  = ({ onAddClick, searchTerm, onSearchChange }) => {
    return (
        <div className="header">
            <button className="add" onClick={onAddClick}>
                <AddIcon/>
            </button>
            <div className="form">
                <input
                    className="input"
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </div>
    )
}

export default Header;