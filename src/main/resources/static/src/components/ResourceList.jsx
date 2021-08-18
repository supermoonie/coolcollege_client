import React from "react";
import {withStyles} from "@material-ui/core";
import {AxiosInstance as axios} from "axios";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

const resourceListUrl = "https://coolapi.coolcollege.cn/enterprise-api/course/resource/list?keyword={keyword}&parent_id={parentId}&resource_classify={resourceClassify}&page_number={pageIndex}&page_size={pageSize}&course_flag={courseFlag}&review={review}&access_token={token}";

const styles = theme => ({

});

class ResourceList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {

    }

    fetchResourceList = (keyword, parentId, resourceClassify, pageIndex, pageSize, courseFlag, review, token) => {
        return axios.get(resourceListUrl.format({
            keyword: keyword,
            parentId: parentId,
            resourceClassify: resourceClassify,
            pageIndex: pageIndex,
            pageSize: pageSize,
            courseFlag: courseFlag,
            review: review,
            token: token
        }))
    };

    render() {
        return <React.Fragment>
            <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" onClick={() => {

                }}>
                    Material-UI
                </Link>
                <Link color="inherit" href="" onClick={() => {

                }}>
                    Core
                </Link>
                <Typography color="textPrimary">Breadcrumb</Typography>
            </Breadcrumbs>
        </React.Fragment>
    }
}

export default withStyles(styles)(ResourceList);