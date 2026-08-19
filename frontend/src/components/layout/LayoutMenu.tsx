import { Button, Image, Layout, Menu } from 'antd';
import st from './style.module.scss';
import logo from '../../assets/logo.svg';
import { ProfileOutlined, BarChartOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router';
import type { MenuProps } from 'antd/lib/menu';
import { LogoutOutlined } from '@ant-design/icons';
import { Content, Header } from "antd/es/layout/layout";

const LayoutMenu = () => {
    const navigate = useNavigate();
    const menuItems: MenuProps['items'] = [
        { key: '/violations', icon: <ProfileOutlined />, label: 'Нарушения' },
        { key: '/dashboard', icon: <BarChartOutlined />, label: 'Дашборд' },
    ];

    const handleExit = () => {
        navigate('/login');
    };

    return (
        <Layout className={st.layout}>
            <Header className={st.layout__header}>
                <div className={st.layout__block}>
                    <Image
                        src={logo}
                        width={60}
                        preview={false}
                        className={st.layout__img}
                    />
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={handleExit}
                    >Выход</Button>
                </div>
                <Menu
                    theme="light"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
            </Header>
            <Content className={st.layout__content}>
                <Outlet />
            </Content>
        </Layout>
    )
};

export default LayoutMenu