import React from 'react';
import {ThemeProvider, withStyles} from "@material-ui/core";
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import {SnackbarProvider} from 'notistack';
import Container from "@material-ui/core/Container";
import LightTheme from "@/components/LightTheme";
import DarkTheme from "@/components/DarkTheme";
import CssBaseline from "@material-ui/core/CssBaseline";
import {SpeedDial, SpeedDialIcon} from "@material-ui/lab";
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import Theme from "@/lib/Theme";
import * as echarts from 'echarts';

const URL_MAP = {
    'queryCourseByPage': "https://coolapi.coolcollege.cn/enterprise-api/course/queryCourseByPage?pageNumber={pageIndex}&pageSize={pageSize}&timestamp={timestamp}&classifyId=&queryType=&title=&statusType=all&sortType=all&classifyType=all&order=desc&image_text=all&liveCourseStatus=false&access_token={token}"
}

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
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(8),
    },
    container: {
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        padding: 0
    }
});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: undefined,
            dark: true,
            openSpeedDial: false,
            token: undefined
        }
    }

    componentDidMount() {
        let url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        this.setState({
            token: token
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
                <Container className={classes.container}>
                    <SpeedDial
                        ariaLabel=""
                        className={classes.speedDial}
                        hidden={false}
                        icon={<SpeedDialIcon openIcon={<EditIcon/>}/>}
                        onClose={() => {
                            this.setState({
                                openSpeedDial: false
                            })
                        }}
                        onOpen={() => {
                            this.setState({
                                openSpeedDial: true
                            })
                        }}
                        open={this.state.openSpeedDial}
                    >
                        <SpeedDialAction
                            key={"newConnection"}
                            icon={<AddIcon/>}
                            tooltipTitle={""}
                            title={""}
                            onClick={() => {
                                this.setState({
                                    showNewConnection: true,
                                    openSpeedDial: false
                                })
                            }}
                        />
                        <SpeedDialAction
                            key={"switchTheme"}
                            title={""}
                            icon={this.state.dark ? <Brightness7Icon/> : <Brightness4Icon/>}
                            tooltipTitle={""}
                            onClick={() => {
                                Theme.setTheme(this.state.dark ? 'light' : 'dark').then(res => {
                                    this.setState({
                                        dark: !this.state.dark,
                                        openSpeedDial: false
                                    })
                                })
                            }}
                        />
                    </SpeedDial>
                </Container>
            </SnackbarProvider>
        </ThemeProvider>
    }
}


export default withStyles(styles)(App);