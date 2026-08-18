import { Card, Typography } from "antd";
import st from './style.module.scss';
import AuthForm from "../../components/form/AuthForm";
import type { FieldProps } from "../../models/models";

const Registration = () => {
    const fields: FieldProps[] = [
        {
            label: 'Фамилия',
            placeholder: 'Введите фамилию',
            private: false,
            rules:
                [
                    { required: true, message: 'Введите фамилию' },
                    {type:'string', message: 'Допустимы только буквы'}
                ],
        },
        {
            label: 'Имя',
            placeholder: 'Введите имя',
            private: false,
            rules:
                [
                    { required: true, message: 'Введите имя' },
                    {type:'string', message: 'Допустимы только буквы'}
                ],
        },
        {
            label: 'Отчество',
            placeholder: 'Введите отчество',
            private: false,
            rules:
                [
                    { required: true, message: 'Введите отчество' },
                    {type:'string', message: 'Допустимы только буквы'}
                ],
        },
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
            private: false,
            rules:
                [
                    { required: true, message: 'Введите пароль' },
                ],
        },
    ];

    return (
        <div className={st.container}>
            <h1>РЕЕСТР | НАРУШЕНИЙ</h1>
            <Card className={st.container__card} title='Регистрация'>
                <Typography.Text>
                    <AuthForm
                        fields={fields}
                        button={{
                            label: 'Зарегистрироваться',
                            func: () => alert('Вход')
                        }}
                    />
                </Typography.Text>
            </Card>
        </div>
    )
};

export default Registration;