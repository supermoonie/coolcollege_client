import React from "react";
import {Container, Grid, withStyles} from "@material-ui/core";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import Theme from "@/lib/Theme";
import GetAppIcon from "@material-ui/icons/GetApp";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import File from "@/lib/File";
import Preferences from "@/lib/Preferences";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";

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

class About extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        const classes = this.props.classes;
        return <Container className={classes.root}>
            <Grid container className={classes.grid}>
                <List subheader={<ListSubheader>关于</ListSubheader>} className={classes.list}>
                    <Divider/>
                    <Grid container justifyContent="center" alignItems="center" style={{marginTop: 50}}>
                        <Grid item>
                            <Typography variant="h4" component="span">
                                仅供学习交流，严禁用于商业用途，请于24小时内删除!
                            </Typography>

                        </Grid>
                    </Grid>
                </List>
            </Grid>
        </Container>
    }
}

export default withStyles(styles)(About);