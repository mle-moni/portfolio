const Project = Backbone.Model.extend({
	defaults: {
		visible: true
	}
});

class ProjectCollection extends Backbone.Collection {
	constructor(opts) {
		super(opts);
		this.model = Project;
	}
}

export { Project, ProjectCollection };