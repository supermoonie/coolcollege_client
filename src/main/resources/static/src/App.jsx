import React from 'react';
import {AppBar, ListItemIcon, Tab, Tabs, ThemeProvider, withStyles} from "@material-ui/core";
import {SnackbarProvider} from 'notistack';
import Container from "@material-ui/core/Container";
import LightTheme from "@/components/LightTheme";
import DarkTheme from "@/components/DarkTheme";
import CssBaseline from "@material-ui/core/CssBaseline";
import Theme from "@/lib/Theme";
import * as echarts from 'echarts';
import TabPanel from "@/components/TabPanel";
import CourseList from "@/components/CourseList";
import ResourceList from "@/components/ResourceList";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import MouseIcon from '@material-ui/icons/Mouse';
import GetAppIcon from '@material-ui/icons/GetApp';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';

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
        }
    }

    componentDidMount() {
        let url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const eid = url.searchParams.get("eid");
        console.log(eid);
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

    render() {
        const classes = this.props.classes;
        return <ThemeProvider theme={this.state.dark ? DarkTheme : LightTheme}>
            <SnackbarProvider maxSnack={3}>
                <CssBaseline/>
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
                        <ListItem button key="spider" alignItems="center" selected>
                            <ListItemIcon style={{minWidth: 45}}><MouseIcon/></ListItemIcon>
                            <ListItemText primary="采集区"/>
                        </ListItem>
                        <ListItem button key="download">
                            <ListItemIcon style={{minWidth: 45}}><GetAppIcon/></ListItemIcon>
                            <ListItemText>
                                <Badge badgeContent={4} color="primary">
                                    下载区
                                </Badge>
                            </ListItemText>
                        </ListItem>
                    </List>
                    <Divider/>
                    <List>
                        <ListItem button key={'settings'}>
                            <ListItemIcon style={{minWidth: 45}}><SettingsIcon/></ListItemIcon>
                            <ListItemText primary="设置"/>
                        </ListItem>
                        <ListItem button key={'about'}>
                            <ListItemIcon style={{minWidth: 45}}><InfoIcon/></ListItemIcon>
                            <ListItemText primary="关于"/>
                        </ListItem>
                    </List>
                </Drawer>
                <Container className={classes.container}>
                    <AppBar position="fixed" color="default" style={{paddingLeft: 155}}>
                        <Tabs value={this.state.activeTab}
                              indicatorColor="primary"
                              textColor="primary"
                              onChange={(event, value) => {
                                  console.log(value);
                                  this.setState({
                                      activeTab: value
                                  })
                              }}>
                            <Tab label={"课程库"} id={"tab-0"} aria-details={"tab-panel-0"}/>
                            <Tab label={"素材库"} id={"tab-1"} aria-details={"tab-panel-1"}/>
                        </Tabs>
                    </AppBar>
                    <TabPanel value={this.state.activeTab} index={0} style={{marginTop: '48px', marginBottom: '64px'}}>
                        {
                            !!this.state.token ? <CourseList token={this.state.token} eid={this.state.eid}/> : null
                        }
                    </TabPanel>
                    <TabPanel value={this.state.activeTab} index={1}>
                        {
                            !!this.state.token ? <ResourceList token={this.state.token} eid={this.state.eid}/> : null
                        }
                    </TabPanel>

                    {/*<SpeedDial*/}
                    {/*    ariaLabel=""*/}
                    {/*    className={classes.speedDial}*/}
                    {/*    hidden={false}*/}
                    {/*    icon={<SpeedDialIcon openIcon={<EditIcon/>}/>}*/}
                    {/*    onClose={() => {*/}
                    {/*        this.setState({*/}
                    {/*            openSpeedDial: false*/}
                    {/*        })*/}
                    {/*    }}*/}
                    {/*    onOpen={() => {*/}
                    {/*        this.setState({*/}
                    {/*            openSpeedDial: true*/}
                    {/*        })*/}
                    {/*    }}*/}
                    {/*    open={this.state.openSpeedDial}*/}
                    {/*>*/}
                    {/*    <SpeedDialAction*/}
                    {/*        key={"downloadManager"}*/}
                    {/*        icon={<GetAppIcon/>}*/}
                    {/*        tooltipTitle={""}*/}
                    {/*        title={""}*/}
                    {/*        onClick={() => {*/}
                    {/*            this.setState({*/}
                    {/*                openSpeedDial: false*/}
                    {/*            })*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*    <SpeedDialAction*/}
                    {/*        key={"switchTheme"}*/}
                    {/*        title={""}*/}
                    {/*        icon={this.state.dark ? <Brightness7Icon/> : <Brightness4Icon/>}*/}
                    {/*        tooltipTitle={""}*/}
                    {/*        onClick={() => {*/}
                    {/*            Theme.setTheme(this.state.dark ? 'light' : 'dark').then(res => {*/}
                    {/*                console.log(res);*/}
                    {/*                this.setState({*/}
                    {/*                    dark: !this.state.dark,*/}
                    {/*                    openSpeedDial: false*/}
                    {/*                })*/}
                    {/*            })*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*</SpeedDial>*/}
                </Container>
            </SnackbarProvider>
        </ThemeProvider>
    }
}


export default withStyles(styles)(App);