import './styles.css';
import {CloseIcon, SaveIcon} from "../../assets/svg";
import {FC} from "react";
import {Input} from "../Input";

interface Props {
    onClose: () => void;
}

const Form:FC<Props> = ({ onClose }) => {
    return (
        <form className="form-add">
            <div className="head-form">
                <h3 className="contenx">Добавьте новую запись:</h3>
                <button className="close-btn" onClick={onClose}><CloseIcon/></button>
            </div>
            <div className="form-group">
                <Input
                    id="src"
                    type="url"
                    placeholder="URL изображения"
                />
                <Input
                    id="name"
                    type="text"
                    placeholder="Название"
                />
            <button className="save"><SaveIcon/></button>
            </div>
        </form>
    );
}

export default Form;