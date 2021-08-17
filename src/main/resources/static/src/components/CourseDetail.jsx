import React from "react";
import {
    AppBar,
    Dialog,
    IconButton,
    ListItem,
    ListItemText,
    Slide,
    Toolbar,
    Typography,
    withStyles
} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import CloseIcon from "@material-ui/icons/Close";
import Button from "@material-ui/core/Button";

const courseDetailUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/selectOne?id={courseId}&appType=&access_token={token}";
const courseDetailListUrl = "https://coolapi.coolcollege.cn/enterprise-api/v2/{eId}/courses/{courseId}/list?access_token={token}";

const styles = theme => ({
    bottomAppBar: {
        top: 'auto',
        bottom: 0,
    },
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class CourseDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        const classes = this.props.classes;
        return <React.Fragment>
            <Dialog fullScreen open={this.props.showDetailDialog} onClose={() => {
                this.setState({
                    showDetailDialog: false
                })
            }} TransitionComponent={Transition}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => {
                            this.setState({
                                showDetailDialog: false
                            })
                        }} aria-label="close">
                            <CloseIcon/>
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            {
                                this.state.title
                            }
                        </Typography>
                        <Button autoFocus color="inherit" onClick={() => {

                        }}>
                            下载所有
                        </Button>
                    </Toolbar>
                </AppBar>
                <List>
                    <ListItem button>
                        <ListItemText primary="Phone ringtone" secondary="Titania"/>
                    </ListItem>
                    <Divider/>
                    <ListItem button>
                        <ListItemText primary="Default notification ringtone" secondary="Tethys"/>
                    </ListItem>
                </List>
            </Dialog>
        </React.Fragment>
    }
}

export default withStyles(styles)(CourseDetail);