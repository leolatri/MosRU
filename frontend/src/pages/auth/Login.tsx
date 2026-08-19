import { Alert, Card, Spin, Typography } from "antd";
import st from './style.module.scss';
import AuthForm from "../../components/form/AuthForm";
import type { AuthModel, FieldProps } from "../../models/models";
import { useNavigate } from "react-router";
import { useState } from "react";
import { authorization, saveAccessToken } from "../../service/api";

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fields: FieldProps[] = [
        {
            name: 'email',
            label: 'Почта',
            placeholder: 'Введите почту',
            private: false,
            rules:
                [
                    { required: true, message: 'Введите почту' },
                    { type: 'email', message: 'Введите корректную почту' },
                ],
        },
        {
            name: 'password',
            label: 'Пароль',
            placeholder: 'Введите пароль',
            private: true,
            rules:
                [
                    { required: true, message: 'Введите пароль' },
                ],
        },
    ];

    const handleAuth = async (values: AuthModel) => {
        setLoading(true);
        try {
            const result = await authorization(values);
            saveAccessToken(result.accessToken);
            navigate('/violations');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Не удалось зарегаться";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={st.container}>
            <h1>РЕЕСТР | НАРУШЕНИЙ</h1>
            <Card className={st.container__card} title='Вход'>
                {loading && <Spin spinning={loading}/>}
                {error && (
                    <Alert
                        type="error"
                        title={error}
                        showIcon
                    />
                )}
                <Typography.Text>
                    <AuthForm
                        fields={fields}
                        button={{
                            label: 'Войти',
                            func: handleAuth
                        }}
                        link={{
                            label: 'Зарегистрироваться',
                            func: () => navigate('/registration')
                        }}
                    />
                </Typography.Text>
            </Card>
        </div>
    )
};

export default Login;