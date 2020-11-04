class ProjectView extends Backbone.View {
	constructor(opts) {
		super(opts);
		this.tagName = "article";
		this.template = model => `
			<h3>${model.title}</h3>
			<div>${model.content}</div>
		`;
		this.listenTo(this.model, "change", this.render);
	}
	render() {
		if (!this.model.get("visible")) {
			this.$el.hide();
		} else {
			this.$el.show();
			this.$el.html(this.template(this.model.attributes));
		}
		return (this);
	}
	close() {
		this.remove();
	}
}

class ProjectCollectionView extends Backbone.View {
	constructor(opts) {
		super(opts);
		this.tagName = "div";
		this.views = [];
		this.vcons = ProjectView;
	}
	render() {
		_.each(this.views, view => {
			this.views.remove(); // deleting all ProjectViews from dom and memory
		});
		this.views = _.map(this.collection.models, model => {
			return new ProjectView({ model: model });
		});
		_.each(this.views, view => {
			view.render();
			this.$el.append(view.el);
		});
		return (this);
	}
}

export { ProjectView, ProjectCollectionView };