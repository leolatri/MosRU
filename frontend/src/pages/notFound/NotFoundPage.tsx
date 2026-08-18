import { Button, Result } from "antd";
import { useNavigate } from "react-router";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Страница не найдена"
      extra={
        <Button type="primary" onClick={() => navigate('/login')}>
          Перейти на страницу входа
        </Button>
      }
    />
  );
};

export default NotFoundPage;