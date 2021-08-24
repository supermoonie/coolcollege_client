import React from "react";
import {
    Container,
    Divider, Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    withStyles
} from "@material-ui/core";
import axios from "axios";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Chip from '@material-ui/core/Chip';
import FolderIcon from '@material-ui/icons/Folder';
import GetAppIcon from "@material-ui/icons/GetApp";
import Download from "@/lib/Download";
import { Scrollbars } from 'react-custom-scrollbars';
import Button from "@material-ui/core/Button";
import {withSnackbar} from 'notistack';

const resourceListUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/resource/list?keyword={keyword}&parent_id={parentId}&resource_classify={resourceClassify}&page_number={pageIndex}&page_size={pageSize}&course_flag={courseFlag}&review={review}&access_token={token}";

const styles = theme => ({
    container: {
        width: '100%',
        height: '100%',
        paddingTop: 64,
        overflow: 'hidden'
    }
});

const StyledBreadcrumb = withStyles((theme) => ({
    root: {
        height: theme.spacing(3),
        fontWeight: theme.typography.fontWeightRegular
    },
}))(Chip);

class ResourceList extends React.Component {

    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            keyword: '',
            parentId: 0,
            resourceClassify: 0,
            pageIndex: 0,
            pageSize: 20,
            totalPage: 0,
            totalRows: 0,
            courseFlag: 1,
            review: 'block',
            items: [],
            breadcrumbs: []
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
            pageIndex: this.state.pageIndex + 1,
            pageSize: this.state.pageSize,
            courseFlag: this.state.courseFlag,
            review: this.state.review,
            token: this.props.token
        })).then(res => {
            const data = res.data;
            console.log(data);
            if ('code' in data && data['code'] === 801) {
                window.location.href = 'https://pro.coolcollege.cn/#/index-auth-login-new?source=ding';
                return;
            }
            this.setState({
                totalPage: data['pages'],
                totalRows: data['total'],
                pageIndex: data['page_num'] - 1,
                items: data['list']
            }, () => {
                console.log(this.state);
            })
        })
    };

    render() {
        const classes = this.props.classes;
        return <React.Fragment>
            <Container className={classes.container}>
                <Grid container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center">
                    <Grid item lg={10}>
                        <Breadcrumbs aria-label="breadcrumb">
                            <StyledBreadcrumb
                                key={'bread--'}
                                component="a"
                                href="#"
                                label="公共区"
                                icon={<FolderIcon fontSize="small"/>}
                                onClick={() => {
                                    this.setState({
                                        parentId: 0,
                                        resourceClassify: 0,
                                        pageIndex: 0,
                                        breadcrumbs: []
                                    }, () => {
                                        this.fetchResourceList();
                                    })
                                }}
                            />
                            {
                                this.state.breadcrumbs.map((item, index) => (
                                    <StyledBreadcrumb
                                        key={'bread-' + index}
                                        component="a"
                                        href="#"
                                        label={item['name']}
                                        icon={<FolderIcon fontSize="small"/>}
                                        onClick={() => {
                                            let breadcrumbs = this.state.breadcrumbs;
                                            let index = 0;
                                            for (let i = 0; i < breadcrumbs.length; i ++) {
                                                if (breadcrumbs[i]['id'] === item['id']) {
                                                    index = i + 1;
                                                    break;
                                                }
                                            }
                                            console.log(index);
                                            let newBreadcrumbs = 0 === index ? [] : breadcrumbs.slice(0, index);
                                            this.setState({
                                                parentId: item['id'],
                                                resourceClassify: item['id'],
                                                pageIndex: 0,
                                                breadcrumbs: newBreadcrumbs
                                            }, () => {
                                                this.fetchResourceList();
                                            })
                                        }}
                                    />
                                ))
                            }
                        </Breadcrumbs>
                    </Grid>
                    <Grid item lg={2} style={{textAlign: 'right'}}>
                        <Button variant="contained" color="primary" size="small" onClick={() => {
                            let req = this.state.items.filter(item => item.type === 'resource').map(item => (
                                {
                                    downloadId: item['resource']['id'],
                                    url: item['resource']['type'] === 'mp4' ? item['resource']['path'] : item['resource']['url'],
                                    savePath: this.props.settings.downloadFolder,
                                    fileName: item['resource']['name'],
                                    extension: item['resource']['type']
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
                    </Grid>
                </Grid>

                <Divider style={{marginTop: 10}}/>
                <Paper style={{height: 'calc(100% - 96px)'}}>
                    <TableContainer style={{height: '100%'}}>
                        <Scrollbars autoHide
                                    autoHideTimeout={1000}
                                    autoHideDuration={200}
                                    style={{height: '100%'}}>
                            <Table stickyHeader>
                                <TableHead >
                                    <TableRow>
                                        <TableCell align="center">index</TableCell>
                                        <TableCell align="center">文件名</TableCell>
                                        <TableCell align="center">创建时间</TableCell>
                                        <TableCell align="center">类型</TableCell>
                                        <TableCell align="center">操作</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        this.state.items.map((item, index) => (
                                            item['type'] === 'resource' ?
                                                <TableRow hover key={'detail-item-' + index}>
                                                    <TableCell component="th" scope="row" align="center">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell component="th" scope="row" align="center">
                                                        {item['resource']['name']}
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">{new Date(item['resource']['createTime']).format('yyyy-MM-dd hh:mm:ss')}</TableCell>
                                                    <TableCell
                                                        align="center">{item['resource']['type']}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton edge="start" aria-label="download" size="small" onClick={() => {
                                                            Download.downloadReq([{
                                                                downloadId: item['resource']['id'],
                                                                url: item['resource']['url'],
                                                                savePath: this.props.settings.downloadFolder,
                                                                fileName: item['resource']['name'],
                                                                extension: item['resource']['type']
                                                            }]).then(res => {
                                                                console.log(res);
                                                            })
                                                        }}>
                                                            <GetAppIcon/>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                                :
                                                <TableRow hover style={{cursor: 'pointer'}} key={'detail-item-' + index}
                                                          onClick={e => {
                                                              e.preventDefault();
                                                              let breadcrumbs = this.state.breadcrumbs;
                                                              breadcrumbs.push({
                                                                  name: item['resource']['name'],
                                                                  id: item['resource']['id']
                                                              });
                                                              this.setState({
                                                                  parentId: item['resource']['id'],
                                                                  resourceClassify: item['resource']['id'],
                                                                  breadcrumbs: breadcrumbs
                                                              }, () => {
                                                                  this.fetchResourceList();
                                                              })
                                                          }}>
                                                    <TableCell component="th" scope="row" align="center">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell component="th" scope="row" align="center">
                                                        {item['resource']['name']}
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">{new Date(item['resource']['createTime']).format('yyyy-MM-dd hh:mm:ss')}</TableCell>
                                                    <TableCell component="th" scope="row" align="center">
                                                        -
                                                    </TableCell>
                                                    <TableCell align="center">{""}</TableCell>
                                                </TableRow>

                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </Scrollbars>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[20, 30, 40, 50]}
                        component="div"
                        count={this.state.totalRows}
                        rowsPerPage={this.state.pageSize}
                        page={this.state.pageIndex}
                        onPageChange={(event, page) => {
                            console.log(page);
                            this.setState({
                                pageIndex: page
                            }, () => {
                                this.fetchResourceList();
                            })
                        }}
                        onRowsPerPageChange={e => {
                            this.setState({
                                pageSize: e.target.value
                            }, () => {
                                this.fetchResourceList();
                            })
                        }}
                    />
                </Paper>
            </Container>
        </React.Fragment>
    }
}

export default withStyles(styles)(withSnackbar(ResourceList));