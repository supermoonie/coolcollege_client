import React from "react";
import {
    AppBar,
    IconButton,
    ListItem, ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Toolbar,
    withStyles
} from "@material-ui/core";
import List from "@material-ui/core/List";
import GetAppIcon from "@material-ui/icons/GetApp";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {Scrollbars} from 'react-custom-scrollbars';
import Box from "@material-ui/core/Box";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Download from "@/lib/Download";
import {withSnackbar} from "notistack";

const courseDetailUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/selectOne?id={courseId}&appType=&access_token={token}";

const styles = theme => ({
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    list: {
        width: '90%',
        maxWidth: '90%',
        marginLeft: '5%',
        marginRight: '5%',
        height: '100%',
        maxHeight: '100%'
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
        return <Box style={{width: '100%', height: 'calc(100% + 48px)', paddingTop: 64}}>
            <Scrollbars autoHide
                        autoHideTimeout={1000}
                        autoHideDuration={200}
                        autoHeightMin={document.body.offsetHeight - 40}>
                <AppBar position="fixed" style={{paddingLeft: 150, paddingRight: '2%'}}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => {
                            this.props.onClose();
                        }} aria-label="close">
                            <ArrowBackIcon/>
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            {
                                this.state.title
                            }
                        </Typography>
                        <Button color="inherit" onClick={() => {
                            let req = this.state.detailItems.map(item => (
                                {
                                    url: item['type'] === 'mp4' ? item['path'] : item['url'],
                                    downloadId: item['id'],
                                    savePath: this.props.settings.downloadFolder,
                                    fileName: item['name'],
                                    extension: item['type']
                                }
                            ));
                            if (req.length === 0) {
                                this.props.enqueueSnackbar("无可下载文件", {variant: 'default',  anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }});
                                return;
                            }
                            Download.downloadReq(req).then(res => {
                                console.log(res);
                            })
                        }}>
                            下载所有
                        </Button>
                    </Toolbar>
                </AppBar>
                <List className={classes.list}>
                    {
                        this.state.detailItems.map((item, index) => (
                            <ListItem button key={'detail-item-' + index}>
                                <ListItemIcon>{index + 1}</ListItemIcon>
                                <ListItemText primary={item['actualName']} style={{width: '80%'}}/>
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="delete" onClick={() => {
                                        Download.downloadReq([{
                                            url: item['type'] === 'mp4' ? item['path'] : item['url'],
                                            downloadId: item['id'],
                                            savePath: this.props.settings.downloadFolder,
                                            fileName: item['name'],
                                            extension: item['type']
                                        }]).then(res => {
                                            console.log(res);
                                        })
                                    }}>
                                        <GetAppIcon/>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    }
                </List>
            </Scrollbars>
        </Box>
    }
}

export default withStyles(styles)(withSnackbar(CourseDetail));