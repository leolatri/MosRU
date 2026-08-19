import { Image, Layout, Menu } from 'antd';
import st from './style.module.scss';
import { Content, Header } from "antd/es/layout/layout";
import logo from '../../assets/logo.svg';
import { ProfileOutlined  , BarChartOutlined  } from '@ant-design/icons';
import { Outlet } from 'react-router';
import type { MenuProps } from 'antd/lib/menu';

const LayoutMenu = () => {
    const menuItems: MenuProps['items'] = [
        { key: '/violations', icon: <ProfileOutlined/>, label: 'Нарушения' },
        { key: '/dashboard', icon: <BarChartOutlined  /> , label: 'Дашборд' },
    ];
    return (
        <Layout className={st.layout}>
            <Header className={st.layout__header}>
                <Image
                    src={logo}
                    width={60}
                    preview={false}
                    className={st.layout__img}
                />
                <Menu
                    theme="light"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
            </Header>
            <Content className={st.layout__content}>
                <Outlet/>
            </Content>
        </Layout>
    )
};

export default LayoutMenu