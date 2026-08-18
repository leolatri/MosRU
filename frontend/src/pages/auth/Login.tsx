import { Card, Typography } from "antd";
import st from './style.module.scss';
import AuthForm from "../../components/form/AuthForm";
import type { FieldProps } from "../../models/models";

const Login = () => {
    const fields: FieldProps[] = [
        {
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
            label: 'Пароль',
            placeholder: 'Введите пароль',
            private: true,
            rules:
                [
                    { required: true, message: 'Введите пароль' },
                ],
        },
    ];

    return (
        <div className={st.container}>
            <h1>РЕЕСТР | НАРУШЕНИЙ</h1>
            <Card className={st.container__card} title='Вход'>
                <Typography.Text>
                    <AuthForm
                        fields={fields}
                        button={{
                            label: 'Войти',
                            func: () => alert('Вход')
                        }}
                        link={{
                            label: 'Зарегистрироваться',
                            func: () => alert('Регистрация')
                        }}
                    />
                </Typography.Text>
            </Card>
        </div>
    )
};

export default Login;