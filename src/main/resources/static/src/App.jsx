import React from 'react';
import {ListItemIcon, ThemeProvider, withStyles} from "@material-ui/core";
import {SnackbarProvider} from 'notistack';
import Container from "@material-ui/core/Container";
import LightTheme from "@/components/LightTheme";
import DarkTheme from "@/components/DarkTheme";
import CssBaseline from "@material-ui/core/CssBaseline";
import Theme from "@/lib/Theme";
import * as echarts from 'echarts';
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import MouseIcon from '@material-ui/icons/Mouse';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';
import Collection from "./components/Collection";
import DownloadManager from "./components/DownloadManager";
import Settings from "./components/Settings";
import About from "./components/About";

echarts.registerTheme('custom-dark', {
    legend: {
        textStyle: {
            color: 'rgba(255, 255, 255, 0.8)'
        },
        inactiveColor: 'rgba(255, 255, 255, 0.3)'
    }
});

const styles = theme => ({
    speedDial: {
        zIndex: 1150,
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(8),
    },
    container: {
        width: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        height: '100%',
        paddingLeft: 150,
        margin: 0,
        padding: 0
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start',
    },
    drawerPaper: {
        width: 150,
    },
});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: undefined,
            dark: true,
            activeTab: 0,
            openSpeedDial: false,
            token: undefined,
            eid: undefined,
            selectedMenu: 'settings'
        }
    }

    componentDidMount() {
        let url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const eid = url.searchParams.get("eid");
        this.setState({
            token: token,
            eid: eid
        });
        Theme.getTheme().then(theme => {
            this.setState({
                dark: "dark" === theme
            })
        })
    }

    onDark = (dark) => {
        this.setState({
            dark: dark
        })
    };

    render() {
        const classes = this.props.classes;
        const router = {
            collection: <Collection token={this.state.token} eid={this.state.eid}/>,
            download_manager: <DownloadManager/>,
            settings: <Settings onDark={this.onDark} dark={this.state.dark}/>,
            about: <About/>
        };
        return <ThemeProvider theme={this.state.dark ? DarkTheme : LightTheme}>
            <SnackbarProvider maxSnack={3}>
                <CssBaseline/>
                {/*左侧菜单栏*/}
                <Drawer
                    variant="persistent"
                    anchor="left"
                    open={true}
                    classes={{
                        paper: classes.drawerPaper
                    }}
                >
                    <List>
                        <div className={classes.drawerHeader}>

                        </div>
                        <ListItem button key="collection"
                                  style={{marginBottom: 2}}
                                  selected={'collection' === this.state.selectedMenu}
                                  onClick={() => {
                                      this.setState({
                                          selectedMenu: 'collection'
                                      })
                                  }}>
                            <ListItemIcon style={{minWidth: 45}}><MouseIcon/></ListItemIcon>
                            <ListItemText primary="采集区"/>
                        </ListItem>
                        <ListItem button key="download_manager"
                                  selected={'download_manager' === this.state.selectedMenu}
                                  onClick={() => {
                                      this.setState({
                                          selectedMenu: 'download_manager'
                                      })
                                  }}>
                            <ListItemIcon style={{minWidth: 45}}><ImportExportIcon/></ListItemIcon>
                            <ListItemText>
                                <Badge badgeContent={4} color="primary">
                                    传输区
                                </Badge>
                            </ListItemText>
                        </ListItem>
                    </List>
                    <Divider/>
                    <List>
                        <ListItem button key={'settings'} selected={'settings' === this.state.selectedMenu}
                                  onClick={() => {
                                      this.setState({
                                          selectedMenu: 'settings'
                                      })
                                  }}>
                            <ListItemIcon style={{minWidth: 45}}><SettingsIcon/></ListItemIcon>
                            <ListItemText primary="设置"/>
                        </ListItem>
                        <ListItem button key={'about'}
                                  style={{marginTop: 2}}
                                  selected={'about' === this.state.selectedMenu}
                                  onClick={() => {
                                      this.setState({
                                          selectedMenu: 'about'
                                      })
                                  }}>
                            <ListItemIcon style={{minWidth: 45}}><InfoIcon/></ListItemIcon>
                            <ListItemText primary="关于"/>
                        </ListItem>
                    </List>
                </Drawer>

                <Container className={classes.container}>
                    {
                        router[this.state.selectedMenu]
                    }
                </Container>
            </SnackbarProvider>
        </ThemeProvider>
    }
}


export default withStyles(styles)(App);