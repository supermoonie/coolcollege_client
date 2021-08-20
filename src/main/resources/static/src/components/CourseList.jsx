import React from "react";
import {
    AppBar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Grid,
    MenuItem,
    Select,
    Toolbar,
    Typography,
    withStyles
} from "@material-ui/core";
import {Pagination} from "@material-ui/lab";
import axios from "axios";
import CourseDetail from "@/components/CourseDetail";

const courseUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/queryCourseByPage?pageNumber={pageIndex}&pageSize={pageSize}&timestamp={timestamp}&classifyId=&queryType=&title=&statusType=all&sortType=all&classifyType=all&order=desc&image_text=all&liveCourseStatus=false&access_token={token}";

const styles = theme => ({
    card: {
        width: '100%'
    },
    media: {
        height: 100,
    },
    bottomAppBar: {
        top: 'auto',
        bottom: 0,
        paddingLeft: 150
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
});

class CourseList extends React.Component {

    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            pageIndex: 1,
            pageSize: 24,
            totalPage: 0,
            items: [],
            selectedCourseId: undefined,
            showDetail: false,
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

    render() {
        const classes = this.props.classes;
        return <React.Fragment>
            {
                this.state.showDetail ?
                    <CourseDetail
                        token={this.props.token}
                        courseId={this.state.selectedCourseId}
                        onClose={() => {
                            this.setState({
                                showDetail: false
                            })
                        }}
                    /> : <Box style={{padding: 0}}>
                        <Grid container direction="row" justifyContent="space-evenly" alignItems="flex-start" spacing={4}>
                            {
                                this.state.items.map((item, index) => (
                                    <Grid item lg={2} md={3} sm={3} xl={3} xs={6} key={'item-' + index}>
                                        <Card className={classes.card} onClick={() => {
                                            // this.fetchDetail(item['id']);
                                            this.setState({
                                                selectedCourseId: item['id'],
                                                showDetail: true
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
                    </Box>
            }
        </React.Fragment>
    }
}

export default withStyles(styles)(CourseList);