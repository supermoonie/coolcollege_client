import React from "react";
import {
    AppBar,
    Container,
    ListItem,
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

const styles = theme => ({
    root: {
        maxHeight: '100%',
        height: '100%',
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 5,
        paddingBottom: 5,
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
            <TabPanel value={this.state.activeTab} index={0} style={{marginTop: '48px'}}>
                <List>
                    {
                        this.props.downloadingList.map((row, index) => (
                            <ListItem button key={'downloading-' + index} style={{marginBottom: 10}}>
                                <ListItemText primary={row.fileName}/>
                                <ListItemSecondaryAction>
                                    <CircularProgressWithLabel size={40} variant="determinate"
                                                               value={row.progress}/>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    }
                </List>
            </TabPanel>
            <TabPanel value={this.state.activeTab} index={1} style={{marginTop: '48px'}}>
                <List>
                    {
                        this.props.downloadedList.map((row, index) => (
                            <ListItem button key={'downloading-' + index} style={{marginBottom: 10}}>
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
            </TabPanel>
        </Container>
    }
}

export default withStyles(styles)(DownloadManager);