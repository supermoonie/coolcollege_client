import React from "react";
import {AppBar, Grid, MenuItem, Select, Toolbar, withStyles} from "@material-ui/core";
import axios from "axios";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import {Pagination} from "@material-ui/lab";

const resourceListUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/resource/list?keyword={keyword}&parent_id={parentId}&resource_classify={resourceClassify}&page_number={pageIndex}&page_size={pageSize}&course_flag={courseFlag}&review={review}&access_token={token}";

const styles = theme => ({
    bottomAppBar: {
        top: 'auto',
        bottom: 0,
    },
});

class ResourceList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            parentId: 0,
            resourceClassify: 0,
            pageIndex: 1,
            pageSize: 20,
            totalPage: 0,
            courseFlag: 1,
            review: 'block',
            items: []
        }
    }

    componentDidMount() {
        this.fetchResourceList();
    }

    fetchResourceList = () => {
        axios.get(resourceListUrl.format({
            keyword: this.state.keyword,
            parentId: this.state.parentId,
            resourceClassify: this.state.resourceClassify,
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize,
            courseFlag: this.state.courseFlag,
            review: this.state.review,
            token: this.props.token
        })).then(res => {
            const data = res.data;
            console.log(data);
            this.setState({
                totalPage: data['pages'],
                pageIndex: data['page_num'],
                items: data['list']
            }, () => {
                console.log(this.state);
            })
        })
    };

    render() {
        const classes = this.props.classes;
        return <React.Fragment>
            <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" href="#" onClick={() => {
                    this.setState({
                        parentId: 0,
                        resourceClassify: 0,
                        pageIndex: 1
                    }, () => {
                        this.fetchResourceList();
                    })
                }}>
                    公共区域
                </Link>
            </Breadcrumbs>

            <AppBar position="fixed" color="default" className={classes.bottomAppBar}>
                <Toolbar>
                    <Grid container spacing={4}>
                        <Grid item>

                        </Grid>
                        <Grid item>
                            <Select
                                style={{width: 100}}
                                labelId="page-size-2"
                                id="page-size-2"
                                value={this.state.pageSize}
                                onChange={e => {
                                    this.setState({
                                        pageSize: e.target.value
                                    }, () => {
                                        this.fetchResourceList();
                                    })
                                }}
                            >
                                <MenuItem value={20}>20条/页</MenuItem>
                                <MenuItem value={30}>30条/页</MenuItem>
                                <MenuItem value={40}>40条/页</MenuItem>
                                <MenuItem value={50}>50条/页</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item>
                            <Pagination count={this.state.totalPage} page={this.state.pageIndex} color="primary"
                                        onChange={(event, page) => {
                                            this.setState({
                                                pageIndex: page
                                            }, () => {
                                                this.fetchResourceList();
                                            })
                                        }}/>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    }
}

export default withStyles(styles)(ResourceList);