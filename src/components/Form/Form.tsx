import './styles.scss';
import {CloseIcon, SaveIcon} from "../../assets/svg";
import {FC, FormEvent, useState} from "react";
import {Input} from "../Input";

interface Props {
    onClose: () => void;
    onAddVideo: (src: string, title: string) => void;
}

const Form: FC<Props> = ({ onClose, onAddVideo }) => {
    const [src, setSrc] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!src.trim() || !name.trim()) {
            alert('Please fill input');
            return;
        }

        onAddVideo(src, name);
    }

    return (
        // Добавляем обработчик onSubmit
        <form className="form-add" onSubmit={handleSubmit}>
            <div className="head-form">
                <h3 className="contenx">Add new article:</h3>
                <button type="button" className="close-btn" onClick={onClose}><CloseIcon/></button>
            </div>
            <div className="form-group">
                <Input
                    id="src"
                    type="url"
                    placeholder="URL изображения"
                    value={src}
                    onChange={(e) => setSrc(e.target.value)}
                />
                <Input
                    id="name"
                    type="text"
                    placeholder="Название"
                    value={name} // Привязываем значение к состоянию
                    onChange={(e) => setName(e.target.value)}
                />
                <button type="submit" className="save"><SaveIcon/></button>
            </div>
        </form>
    );
}

export default Form;