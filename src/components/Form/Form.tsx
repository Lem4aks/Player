import './styles.css';
import {SaveIcon} from "../../assets/svg";

const Form = () => {
    return (
        <div className="form-add">
            <div className="form-group">
            <p>Добавьте новую запись:</p>
            <input id="src" type="url" placeholder="URL изображения" />
            <input id="name" type="text" placeholder="Название" />
            <button className="save"><SaveIcon/></button>
            </div>
        </div>
    );
}

export default Form;