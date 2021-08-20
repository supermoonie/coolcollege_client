import React from "react";
import {AppBar, Tab, Tabs, withStyles} from "@material-ui/core";
import TabPanel from "@/components/TabPanel";
import CourseList from "@/components/CourseList";
import ResourceList from "@/components/ResourceList";

const styles = theme => ({

});

class Collection extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
        }
    }

    render() {
        const classes = this.props.classes;
        return <React.Fragment>
            <AppBar position="fixed" color="default" style={{paddingLeft: 155}}>
                <Tabs value={this.state.activeTab}
                      indicatorColor="primary"
                      textColor="primary"
                      onChange={(event, value) => {
                          this.setState({
                              activeTab: value
                          })
                      }}>
                    <Tab label={"课程库"} id={"tab-0"} aria-details={"tab-panel-0"}/>
                    <Tab label={"素材库"} id={"tab-1"} aria-details={"tab-panel-1"}/>
                </Tabs>
            </AppBar>
            <TabPanel value={this.state.activeTab} index={0} style={{marginTop: '48px', marginBottom: '64px'}}>
                {
                    !!this.props.token ? <CourseList token={this.props.token} eid={this.props.eid}/> : null
                }
            </TabPanel>
            <TabPanel value={this.state.activeTab} index={1}>
                {
                    !!this.props.token ? <ResourceList token={this.props.token} eid={this.props.eid}/> : null
                }
            </TabPanel>
        </React.Fragment>
    }
}

export default withStyles(styles)(Collection);