import React from "react";
import {
    AppBar,
    Container,
    IconButton,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Toolbar, withStyles
} from "@material-ui/core";
import List from "@material-ui/core/List";
import GetAppIcon from "@material-ui/icons/GetApp";
import axios from "axios";
import CloseIcon from '@material-ui/icons/Close';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const courseDetailUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/selectOne?id={courseId}&appType=&access_token={token}";

const styles = theme => ({
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
});

class CourseDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: undefined,
            detailItems: []
        }
    }

    componentDidMount() {
        this.fetchDetail(this.props.courseId);
    }

    fetchDetail = (courseId) => {
        axios.get(courseDetailUrl.format({
            courseId: courseId,
            token: this.props.token
        })).then(res => {
            const data = res.data;
            this.setState({
                title: data['title'],
                detailItems: data['resourceList']
            })
        })
    };

    render() {
        const classes = this.props.classes;
        return <Container style={{padding: 0, height: '100%', maxHeight: '100%'}}>
            <AppBar position="fixed" style={{paddingLeft: 150}}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => {
                        this.props.onClose();
                    }} aria-label="close">
                        <CloseIcon/>
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {
                            this.state.title
                        }
                    </Typography>
                    <Button autoFocus color="inherit" onClick={() => {
                        console.log("下载所有");
                    }}>
                        下载所有
                    </Button>
                </Toolbar>
            </AppBar>
            <List style={{height: '100%', maxHeight: '100%'}}>
                {
                    this.state.detailItems.map((item, index) => (
                        <ListItem button key={'detail-item-' + index}>
                            <ListItemText primary={item['actualName']}/>
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete">
                                    <GetAppIcon/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))
                }
            </List>
        </Container>
    }
}

export default withStyles(styles)(CourseDetail);