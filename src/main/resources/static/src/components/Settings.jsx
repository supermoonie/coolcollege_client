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
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";

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
            dark: props.dark
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
                                checked={this.state.dark}
                                onChange={(event, checked) => {
                                    Theme.setTheme(checked ? 'dark' : 'light').then(res => {
                                        this.setState({
                                            dark: checked
                                        });
                                        this.props.onDark(checked);
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
                                        /Users/supermoonie/Downloads/
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <IconButton color="default" aria-label="folder open" component="span">
                                        <FolderOpenIcon />
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