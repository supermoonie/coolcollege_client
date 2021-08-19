import React from "react";
import {
    AppBar,
    Card,
    CardActionArea,
    CardContent,
    CardMedia, Dialog,
    Grid, IconButton, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, Slide,
    Toolbar,
    Typography,
    withStyles
} from "@material-ui/core";
import {Pagination} from "@material-ui/lab";
import axios from "axios";
import CloseIcon from '@material-ui/icons/Close';
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import GetAppIcon from '@material-ui/icons/GetApp';

const courseUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/queryCourseByPage?pageNumber={pageIndex}&pageSize={pageSize}&timestamp={timestamp}&classifyId=&queryType=&title=&statusType=all&sortType=all&classifyType=all&order=desc&image_text=all&liveCourseStatus=false&access_token={token}";
const courseDetailUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/selectOne?id={courseId}&appType=&access_token={token}";

const styles = theme => ({
    card: {
        width: navigator.userAgent.indexOf('Mac OS') > 0 ? 180 : 280,
    },
    media: {
        height: 100,
    },
    bottomAppBar: {
        top: 'auto',
        bottom: 0,
        paddingLeft: 115
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class CourseList extends React.Component {

    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            showDetailDialog: false,
            selectedTitle: undefined,
            detailItems: [],
            pageIndex: 1,
            pageSize: 24,
            totalPage: 0,
            items: [],
        }
    }

    componentDidMount() {
        this.fetchCourse();
    };

    fetchCourse = () => {
        axios.get(courseUrl.format({
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize,
            timestamp: new Date().getTime(),
            token: this.props.token
        })).then(res => {
            const data = res.data;
            if ('code' in data && data['code'] === 801) {
                window.location.href = 'https://pro.coolcollege.cn/#/index-auth-login-new?source=ding';
                return;
            }
            this.setState({
                totalPage: data['pages'],
                pageIndex: data['pageNum'],
                items: data['list']
            })
        })
    };

    fetchDetail = (courseId) => {
        axios.get(courseDetailUrl.format({
            courseId: courseId,
            token: this.props.token
        })).then(res => {
            const data = res.data;
            console.log(data);
            this.setState({
                selectedTitle: data['title'],
                detailItems: data['resourceList']
            })
        })
    };

    render() {
        const classes = this.props.classes;
        return <React.Fragment>
            <Dialog fullScreen open={this.state.showDetailDialog} onClose={() => {
                this.setState({
                    showDetailDialog: false,
                    selectedTitle: undefined,
                    detailItems: []
                })
            }} TransitionComponent={Transition}>
                <AppBar className={classes.appBar} position="fixed">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => {
                            this.setState({
                                showDetailDialog: false,
                                selectedTitle: undefined,
                                detailItems: []
                            })
                        }} aria-label="close">
                            <CloseIcon/>
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            {
                                this.state.selectedTitle
                            }
                        </Typography>
                        <Button autoFocus color="inherit" onClick={() => {
                            console.log("下载所有");
                        }}>
                            下载所有
                        </Button>
                    </Toolbar>
                </AppBar>
                <List style={{marginTop: '64px', paddingLeft: '10px', paddingRight: '20px'}}>
                    {
                        this.state.detailItems.map((item, index) => (
                            <ListItem button key={'detail-item-' + index}>
                                <ListItemText primary={item['actualName']} secondary={item['path']}/>
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="delete">
                                        <GetAppIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    }
                </List>
            </Dialog>
            <Grid container spacing={4}>
                {
                    this.state.items.map((item, index) => (
                        <Grid item key={'item-' + index}>
                            <Card className={classes.card} onClick={() => {
                                this.fetchDetail(item['id']);
                                this.setState({
                                    showDetailDialog: true
                                })
                            }}>
                                <CardActionArea>
                                    <CardMedia
                                        className={classes.media}
                                        image={item['cover']}
                                        title={item['title']}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="subtitle2">
                                            {item['title']}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>

                    ))
                }
            </Grid>
            <AppBar position="fixed" color="default" className={classes.bottomAppBar}>
                <Toolbar>
                    <Grid container spacing={4}>
                        <Grid item>

                        </Grid>
                        <Grid item>
                            <Select
                                style={{width: 100}}
                                labelId="page-size-1"
                                id="page-size-1"
                                value={this.state.pageSize}
                                onChange={e => {
                                    this.setState({
                                        pageSize: e.target.value
                                    }, () => {
                                        this.fetchCourse();
                                    })
                                }}
                            >
                                <MenuItem value={12}>12条/页</MenuItem>
                                <MenuItem value={24}>24条/页</MenuItem>
                                <MenuItem value={48}>48条/页</MenuItem>
                                <MenuItem value={96}>96条/页</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item>
                            <Pagination count={this.state.totalPage} page={this.state.pageIndex} color="primary"
                                        onChange={(event, page) => {
                                            this.setState({
                                                pageIndex: page
                                            }, () => {
                                                this.fetchCourse();
                                            })
                                        }}/>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    }
}

export default withStyles(styles)(CourseList);