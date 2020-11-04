import { ProjectCollection } from "./models/ProjectModel.js";
import { ProjectCollectionView } from "./views/ProjectView.js";

const projects = new ProjectCollection();
projects.reset(allProjects);

console.log("collection = ")
console.log(projects)

const projectsView = new ProjectCollectionView({
	collection: projects
});

$("#projects")
	.html(projectsView.render().el)
	.css("visibility", "visible");