import './styles.scss';
import {FC} from "react";

interface Props {
    title: string;
}

const Header_video: FC<Props>  = ({ title }) => {
    return (
        <div className="header-video">
            <h2>{title}</h2>
        </div>
    )
}

export default Header_video;