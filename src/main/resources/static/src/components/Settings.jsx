import React from "react";
import {Container, Grid, withStyles} from "@material-ui/core";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import Theme from "@/lib/Theme";
import Brightness4Icon from '@material-ui/icons/Brightness4';
import GetAppIcon from '@material-ui/icons/GetApp';
import Divider from "@material-ui/core/Divider";
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Preferences from "@/lib/Preferences";
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

class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            darkChecked: props.settings.dark
        }
    }

    render() {
        const classes = this.props.classes;
        return <Container className={classes.root}>
            <Grid container className={classes.grid}>
                <List subheader={<ListSubheader>设置</ListSubheader>} className={classes.list}>
                    <Divider/>
                    <ListItem>
                        <ListItemIcon>
                            <Brightness4Icon/>
                        </ListItemIcon>
                        <ListItemText id="switch-list-label-theme" primary="暗黑主题"/>
                        <ListItemSecondaryAction>
                            <Switch
                                color="default"
                                edge="end"
                                checked={this.state.darkChecked}
                                onChange={(event, checked) => {
                                    Theme.setTheme(checked ? 'dark' : 'light').then(res => {
                                        let settings = this.props.settings;
                                        settings.dark = checked;
                                        this.props.onSettingsChange(settings);
                                        this.setState({
                                            darkChecked: checked
                                        });
                                    });
                                }}
                                inputProps={{'aria-labelledby': 'switch-list-label-theme'}}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <GetAppIcon/>
                        </ListItemIcon>
                        <ListItemText id="switch-list-label-folder" primary="下载目录"/>
                        <ListItemSecondaryAction>
                            <Grid container justifyContent="center" alignItems="center" spacing={1}>
                                <Grid item>
                                    <Typography variant="subtitle2">
                                        {this.props.settings.downloadFolder}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <IconButton color="default"
                                                aria-label="folder open"
                                                component="span"
                                                onClick={() => {
                                                    File.folderSelect(this.props.settings.downloadFolder).then(res => {
                                                        if (!res) {
                                                            return;
                                                        }
                                                        Preferences.setString("/download/folder", res).then(resp => {
                                                            console.log(resp);
                                                            let settings = this.props.settings;
                                                            settings.downloadFolder = res;
                                                            this.props.onSettingsChange(settings);
                                                        })
                                                    })
                                                }}>
                                        <FolderOpenIcon/>
                                    </IconButton>
                                </Grid>
                            </Grid>

                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Grid>
        </Container>
    }
}

export default withStyles(styles)(Settings);