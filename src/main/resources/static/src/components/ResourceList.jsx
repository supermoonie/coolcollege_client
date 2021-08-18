import React from "react";
import {
    Container,
    Divider,
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

const resourceListUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/resource/list?keyword={keyword}&parent_id={parentId}&resource_classify={resourceClassify}&page_number={pageIndex}&page_size={pageSize}&course_flag={courseFlag}&review={review}&access_token={token}";

const styles = theme => ({
    bottomAppBar: {
        top: 'auto',
        bottom: 0,
    },
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
            <Container>
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
                <Divider style={{marginTop: 10}}/>
                <Paper>
                    <TableContainer style={{maxHeight: '490px'}}>
                        <Table aria-label="resource table" stickyHeader>
                            <TableHead>
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
                                                    {item['resource']['actualName']}
                                                </TableCell>
                                                <TableCell
                                                    align="center">{new Date(item['resource']['createTime']).format('yyyy-MM-dd hh:mm:ss')}</TableCell>
                                                <TableCell
                                                    align="center">{item['resource']['type']}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton edge="end" aria-label="delete">
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
                                                          })
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

export default withStyles(styles)(ResourceList);