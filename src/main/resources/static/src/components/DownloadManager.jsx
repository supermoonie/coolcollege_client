import React from "react";
import {
    AppBar,
    Container,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Tab,
    Tabs,
    withStyles
} from "@material-ui/core";
import TabPanel from "@/components/TabPanel";
import List from "@material-ui/core/List";
import CircularProgressWithLabel from "@/components/CircularProgressWithLabel";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import IconButton from "@material-ui/core/IconButton";
import File from "@/lib/File";
import {Scrollbars} from 'react-custom-scrollbars';

const styles = theme => ({
    root: {
        maxHeight: '100%',
        height: '100%',
        padding: 0,
        overflow: 'hidden'
    },
    grid: {
        maxHeight: '100%',
        height: '100%',
    },
    list: {
        width: '80%',
        maxWidth: '80%',
        marginLeft: '10%',
        marginRight: '10%'
    },
});

class DownloadManager extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0
        }
    }

    render() {
        const classes = this.props.classes;
        return <Container className={classes.root}>
            <AppBar position="fixed" color="default" style={{paddingLeft: 150}}>
                <Tabs value={this.state.activeTab}
                      indicatorColor="primary"
                      textColor="primary"
                      variant="fullWidth"
                      onChange={(event, value) => {
                          this.setState({
                              activeTab: value
                          })
                      }}>
                    <Tab label={"传输中"} id={"tab-0"} aria-details={"tab-panel-0"}/>
                    <Tab label={"已完成"} id={"tab-1"} aria-details={"tab-panel-1"}/>
                </Tabs>
            </AppBar>
            <TabPanel value={this.state.activeTab} index={0} style={{paddingTop: '48px', height: '100%'}}>
                <Scrollbars autoHide
                            autoHideTimeout={1000}
                            autoHideDuration={200}
                            style={{height: '100%'}}>
                    <List>
                        {
                            this.props.downloadingList.map((row, index) => (
                                <ListItem button key={'downloading-' + index} style={{marginBottom: 10}}>
                                    <ListItemIcon>{index + 1}</ListItemIcon>
                                    <ListItemText primary={row.fileName}/>
                                    <ListItemSecondaryAction>
                                        {
                                            row.status === 'waiting' ? "等待下载" :
                                                <CircularProgressWithLabel size={40} variant="determinate"
                                                                           value={row.progress}/>
                                        }
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        }
                    </List>
                </Scrollbars>

            </TabPanel>
            <TabPanel value={this.state.activeTab} index={1} style={{paddingTop: '48px', height: '100%'}}>
                <Scrollbars autoHide
                            autoHideTimeout={1000}
                            autoHideDuration={200}
                            style={{height: '100%'}}>
                    <List>
                        {
                            this.props.downloadedList.map((row, index) => (
                                <ListItem button key={'downloading-' + index} style={{marginBottom: 10}}>
                                    <ListItemIcon>{index + 1}</ListItemIcon>
                                    <ListItemText primary={row.fileName}/>
                                    <ListItemSecondaryAction>
                                        <IconButton color="default"
                                                    aria-label="folder open"
                                                    component="span"
                                                    onClick={() => {
                                                        File.openFolder(row.path).then(res => console.log(res));
                                                    }}>
                                            <FolderOpenIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        }
                    </List>
                </Scrollbars>
            </TabPanel>
        </Container>
    }
}

export default withStyles(styles)(DownloadManager);