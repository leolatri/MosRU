import { Button, Form, Input } from 'antd';
import type { FieldProps } from '../../models/models';
import st from './style.module.scss';

interface ButtonProps {
    label: string;
    func: () => void;
}

interface AuthFormProps {
    fields: FieldProps[];
    button: ButtonProps;
    link?: ButtonProps;
}

const AuthForm = ({
    fields,
    button,
    link,
}: AuthFormProps) => {
    return (
        <Form
            className={st.authForm}
            layout="vertical"
            onFinish={button.func}
        >
            {fields.map((field) => (
                <Form.Item
                    key={field.label}
                    name={field.label}
                    label={field.label}
                    rules={field.rules}
                >
                    {field.private ? (
                        <Input.Password
                            placeholder={field.placeholder}
                            autoComplete="current-password"
                        />
                    ) : (
                        <Input
                            placeholder={field.placeholder}
                            autoComplete="email"
                        />
                    )}
                </Form.Item>
            ))}

            <Button
                type="primary"
                htmlType="submit"
                className={st.authForm__button}
                block
            >
                {button.label}
            </Button>

            {link && (
                <Button
                    type="link"
                    onClick={link.func}
                    className={st.authForm__link}
                    block
                >
                    {link.label}
                </Button>
            )}
        </Form>
    );
};

export default AuthForm;