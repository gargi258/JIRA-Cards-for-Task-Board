(function (document) {
    'use strict';

    var app = document.querySelector('#app');

    window.addEventListener('WebComponentsReady', function () {

        app._createReferencesForUserConfiguration();

        app.loadUserConfiguration();

    });

    // =========================================================
    // UI
    // =========================================================

    // Scrum card data for the "design" page
    app.demoScrumCard = [{
        key: '302',
        fields: {
            summary: 'This is the task summary',
            description: 'This is some description about the task. Lorem ipsum dolor sit amet, consectetur adipisicing elit!',
            timeoriginalestimate: '21600',
            issuetype: {
                name: 'Task',
                subtask: true
            },
            parent: {
                key: '298',
                fields: {
                    summary: 'Backlog Item'
                }
            },
            priority: {
                name: 'Medium'
            },
            fixVersions: [{
                name: '1.20'
            }, {
                name: '1.30'
            }],
            assignee: {
                displayName: 'John Doe'
            }
        }
    }];

    /**
     * Add all scrum cards for printing.
     */
    app.addAllScrumCardsForPrinting = function () {
        var cards = app.$['scrum-cards-container'].querySelectorAll('.scrum-card');

        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.remove('scrum-card--remove-from-print');
        }
    };

    /**
     * Close drawer after menu item is selected if drawerPanel is narrow
     */
    app.onMenuSelect = function () {
        let drawerPanel = this.$['paper-drawer-panel'];

        if (drawerPanel.narrow) {
            drawerPanel.closeDrawer();
        }
    };

    /**
     * Show message to the user.
     * @param {string} text - The text to display in the toast.
     * @param {number} duration - The duration in milliseconds to show the toast.
     */
    app.showMessage = function (text, duration) {
        let messageToast = this.$['custom-message'];

        if (text) {
            messageToast.setAttribute('text', text);
        } else {
            console.warn('Some text must be given as parameter');
            return;
        }

        messageToast.removeAttribute('duration');

        if (duration) {
            messageToast.setAttribute('duration', duration);
        } else {
            messageToast.setAttribute('duration', 6000);
        }

        messageToast.show();
    };

    /**
     * Remove all scrum cards from printing.
     */
    app.removeAllScrumCardsForPrinting = function () {
        var cards = app.$['scrum-cards-container'].querySelectorAll('.scrum-card');

        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.add('scrum-card--remove-from-print');
        }
    };

    /**
     * Show/hide scrum cards from print print preview
     * @param event
     * @private
     */
    app._toggleCardFromPrinting = function (event) {
        var element = event.target;

        while (element.nodeName !== 'PAPER-BUTTON') {
            element = element.parentNode;
        }

        if (element.active === true) {
            this.addAllScrumCardsForPrinting();
        }

        if (element.active === false) {
            this.removeAllScrumCardsForPrinting();
        }
    };

    // =========================================================
    // Extension storage
    // =========================================================

    /**
     * Load user configuration from chrome storage
     */
    app.loadUserConfiguration = function () {
        var that = this;

        chrome.storage.sync.get('settings', function (object) {

            if (object.settings === undefined) {
                that._defaultsScrumCardSettings();
                that._handlerForInsufficientUserSettings();

                return;
            }

            let settings = object.settings;
            let scrumCard = object.settings.scrumCard;

            that.jiraURL = settings.jiraURL;
            that.jiraProject = settings.jiraProject;
            that.jiraProjectName = settings.jiraProjectName;
            that.isAJAXtoGreenHopper = settings.isAJAXtoGreenHopper;

            that.scrumCardSettings = {
                fontSize: scrumCard.fontSize,
                issueType: {
                    isBold: scrumCard.issueType.isBold,
                    isVisible: scrumCard.issueType.isVisible
                },
                issueKey: {
                    isBold: scrumCard.issueKey.isBold,
                    isVisible: scrumCard.issueKey.isVisible
                },
                parentName: {
                    isBold: scrumCard.parentName.isBold,
                    isVisible: scrumCard.parentName.isVisible
                },
                parentKey: {
                    isBold: scrumCard.parentKey.isBold,
                    isVisible: scrumCard.parentKey.isVisible
                },
                issuePriority: {
                    isBold: scrumCard.issuePriority.isBold,
                    isVisible: scrumCard.issuePriority.isVisible
                },
                issueFixVersions: {
                    isBold: scrumCard.issueFixVersions.isBold,
                    isVisible: scrumCard.issueFixVersions.isVisible
                },
                issueSummary: {
                    isBold: scrumCard.issueSummary.isBold,
                    isVisible: scrumCard.issueSummary.isVisible
                },
                issueDescription: {
                    isBold: scrumCard.issueDescription.isBold,
                    isVisible: scrumCard.issueDescription.isVisible
                },
                issueAssignee: {
                    isBold: scrumCard.issueAssignee.isBold,
                    isVisible: scrumCard.issueAssignee.isVisible
                },
                issueTimeOriginalEstimate: {
                    isBold: scrumCard.issueTimeOriginalEstimate.isBold,
                    isVisible: scrumCard.issueTimeOriginalEstimate.isVisible
                }
            };

            that.showMessage('All user options ware loaded.');

            that._getProjects();
            that._getSprintsForProject();
            that._handlerForInsufficientUserSettings();
        });
    };

    /**
     * Save user configuration from chrome storage
     * TODO create two methods for option card/config
     */
    app.saveUserConfiguration = function () {
        let scrumCardSettings = this.scrumCardSettings;
        let project = this.$['dropdown-for-jira-projects'].selectedItem;

        let optionsToBeSaved = {
            settings: {
                jiraURL: this.jiraURL,
                jiraProject: project ? project.value : '',
                jiraProjectName: project ? project.label : '',
                isAJAXtoGreenHopper: this.isAJAXtoGreenHopper,

                scrumCard: {
                    fontSize: scrumCardSettings.fontSize,
                    issueType: {
                        isBold: scrumCardSettings.issueType.isBold,
                        isVisible: scrumCardSettings.issueType.isVisible
                    },
                    issueKey: {
                        isBold: scrumCardSettings.issueKey.isBold,
                        isVisible: scrumCardSettings.issueKey.isVisible
                    },
                    parentName: {
                        isBold: scrumCardSettings.parentName.isBold,
                        isVisible: scrumCardSettings.parentName.isVisible
                    },
                    parentKey: {
                        isBold: scrumCardSettings.parentKey.isBold,
                        isVisible: scrumCardSettings.parentKey.isVisible
                    },
                    issuePriority: {
                        isBold: scrumCardSettings.issuePriority.isBold,
                        isVisible: scrumCardSettings.issuePriority.isVisible
                    },
                    issueFixVersions: {
                        isBold: scrumCardSettings.issueFixVersions.isBold,
                        isVisible: scrumCardSettings.issueFixVersions.isVisible
                    },
                    issueSummary: {
                        isBold: scrumCardSettings.issueSummary.isBold,
                        isVisible: scrumCardSettings.issueSummary.isVisible
                    },
                    issueDescription: {
                        isBold: scrumCardSettings.issueDescription.isBold,
                        isVisible: scrumCardSettings.issueDescription.isVisible
                    },
                    issueAssignee: {
                        isBold: scrumCardSettings.issueAssignee.isBold,
                        isVisible: scrumCardSettings.issueAssignee.isVisible
                    },
                    issueTimeOriginalEstimate: {
                        isBold: scrumCardSettings.issueTimeOriginalEstimate.isBold,
                        isVisible: scrumCardSettings.issueTimeOriginalEstimate.isVisible
                    }
                }
            }
        };

        chrome.storage.sync.set(optionsToBeSaved, function () {
            app.showMessage('All user options were saved.');
        });
    };

    /**
     * Remove user configuration from chrome storage
     */
    app.removeUserConfiguration = function () {
        chrome.storage.sync.remove('settings', function (object) {
            app.showMessage('All user options were deleted.');
        });
    };

    // =========================================================
    // Private methods
    // =========================================================

    app._clickHandlerForSprintRequest = function (event) {
        var target = event.target;

        if (target.nodeName === 'SPAN') {
            target = target.parentElement;
        }

        if (target.nodeName !== 'PAPER-ITEM') {
            return;
        }

        this.jiraProject = target.value;
        this.jiraProjectName = target.label;
        this._getSprintsForProject();
    };

    /**
     * Create needed reference for data binding and loading user configuration
     * @private
     */
    app._createReferencesForUserConfiguration = function () {
        this.scrumCardSettings = {
            fontSize: {},
            issueType: Object.create(null),
            issueKey: Object.create(null),
            parentName: Object.create(null),
            parentKey: Object.create(null),
            issuePriority: Object.create(null),
            issueFixVersions: Object.create(null),
            issueSummary: Object.create(null),
            issueDescription: Object.create(null),
            issueAssignee: Object.create(null),
            issueTimeOriginalEstimate: Object.create(null)
        };

    };

    /**
     * Check responses for errors
     * @param ironAJAX
     * @private
     */
    app._checkAJAXResponseForErrors = function (ironAJAX) {
        if (ironAJAX.status === 0) {
            this.showMessage('It seems that you don\'t have internet connection, please try again later.');
            return false;
        }

        if (ironAJAX.response === null) {
            this.showMessage('It seems that you don\'t have internet connection or you are behind a proxy.');
            return false;
        }

        return true;
    };

    /**
     * Default user setting for scrum card visualization
     * @private
     */
    app._defaultsScrumCardSettings = function () {
        this.scrumCardSettings = {
            fontSize: 20,
            issueType: {
                isBold: false,
                isVisible: true
            },
            issueKey: {
                isBold: false,
                isVisible: true
            },
            parentName: {
                isBold: false,
                isVisible: true
            },
            parentKey: {
                isBold: false,
                isVisible: true
            },
            issuePriority: {
                isBold: false,
                isVisible: true
            },
            issueFixVersions: {
                isBold: false,
                isVisible: true
            },
            issueSummary: {
                isBold: true,
                isVisible: true
            },
            issueDescription: {
                isBold: false,
                isVisible: false
            },
            issueAssignee: {
                isBold: false,
                isVisible: true
            },
            issueTimeOriginalEstimate: {
                isBold: false,
                isVisible: false
            }
        }
    };

    /**
     * Hide all cards that are not from the given assignee
     * @param event
     * @private
     */
    app._filterJIRACardsByAssignee = function (event) {
        let target;
        let assigneeName;
        let cards = this.$['scrum-cards-container'].querySelectorAll('.scrum-card .card-layout');
        let cardsThatWillBeInvisible = [];

        if (event.target.nodeName !== 'PAPER-ITEM' && event.target.nodeName !== 'SPAN') {
            return;
        }

        if (event.target.nodeName === 'SPAN') {
            target = event.target.parentElement;
        }

        if (event.target.nodeName === 'PAPER-ITEM') {
            target = event.target;
        }


        var _insertCSSRule = function (cssRule) {
            var sheet = document.styleSheets[document.styleSheets.length - 1];
            sheet.insertRule(cssRule, sheet.cssRules.length);
        };

        _insertCSSRule('#scrum-cards-container .scrum-card[data-assignee]{ display:block;}');

        assigneeName = target.innerText.trim();
        if (assigneeName !== 'All') {
            _insertCSSRule('#scrum-cards-container .scrum-card:not([data-assignee="' + assigneeName + '"]){ display:none;}');
        }
    };

    /**
     * Trigger AJAX request for all JIRA projects
     * @private
     */
    app._getProjects = function () {
        var that = this;

        // The timeout is needed because the "invalid" property of the paper-input need to be updated after the keyup
        setTimeout(function () {
            let isInputInvalid = that.$['jira-url-address'].invalid;
            let ajaxForProjects = that.$['jira-projects-ajax'];

            if (isInputInvalid) {
                return;
            }

            if (that.isAJAXtoGreenHopper) {
                ajaxForProjects.url = that.jiraURL + '/rest/greenhopper/1.0/rapidview';
            } else {
                ajaxForProjects.url = that.jiraURL + '/rest/api/2/project/';
            }

            ajaxForProjects.generateRequest();

            // Delete all elements in the array,
            // this way the visualized item in the paper-dropdown will be updated accordingly
            that._editedProjects = [];
        }, 100);
    };

    /**
     * Trigger AJAX request for all sprint for the current selected project
     * @private
     */
    app._getSprintsForProject = function () {
        let ajaxForVersions = this.$['jira-project-sprints-ajax'];
        let project = this.jiraProject;
        let url = this.jiraURL;

        if (!url || !project) {
            return;
        }

        if (this.isAJAXtoGreenHopper) {
            ajaxForVersions.url = url + '/rest/greenhopper/1.0/sprintquery/' + project + '?includeFutureSprints=true&includeHistoricSprints=false';
        } else {
            ajaxForVersions.url = url + '/rest/api/2/project/' + project + '/versions';
        }

        ajaxForVersions.generateRequest();

        // Delete all elements in the array,
        // this way the visualized item in the paper-dropdown will be updated accordingly
        this._editedSprints = [];
    };

    /**
     * Trigger AJAX request for all issues for the current selected sprint
     * @private
     */
    app._getSprintIssues = function () {
        let AJAXForSprintIssues = this.$['jira-sprint-issues-ajax'];

        if (this.isAJAXtoGreenHopper) {
            AJAXForSprintIssues.url = this.jiraURL + '/rest/api/2/search?jql=Sprint=' + this.jiraSprint + '&&maxResults=500';
        } else {
            AJAXForSprintIssues.url = this.jiraURL + '/rest/api/2/search?jql=project=' + this.jiraProject + '+and+fixVersion=' + this.jiraSprint + '&&maxResults=500';
        }

        AJAXForSprintIssues.generateRequest();
    };

    app._handlerForInsufficientUserSettings = function () {
        var isDialogNeed = false;

        if (!this.jiraURL) {
            isDialogNeed = true;
        }

        if (!this.jiraProject) {
            isDialogNeed = true;
        }

        if (!this.jiraProjectName) {
            isDialogNeed = true;
        }

        if (isDialogNeed === true) {
            this.$['dialog-popup'].open();
            this.route = 'configuration';
        }
    };

    app._handlerForGettingSprintIssues = function (event) {
        var target = event.target;

        if (target.nodeName === 'SPAN') {
            target = target.parentElement;
        }

        if (target.nodeName !== 'PAPER-ITEM') {
            return;
        }

        this.jiraSprint = target.value;

        this._getSprintIssues();
    };

    /**
     * Re write the entire scrumCardSettings object
     * That why the custom elements that depend on it will be updated,
     * without observing the sub properties
     * @private
     */
    app._updateScrumCardSettings = function () {
        let settings = this.scrumCardSettings;
        this.scrumCardSettings = null;
        this.scrumCardSettings = settings;
    };

    /**
     * Open Chrome print preview
     * @private
     */
    app._openPrintPreview = function () {
        window.print();
    };

    /**
     * Create a binding reference that is used for selecting the saved project from the user.
     * @param {Array} projects
     * @private
     */
    app._setProjectNameFromConfiguration = function (projects) {
        for (var i = 0; i < projects.length; i++) {
            if (this.jiraProjectName === projects[i].name) {
                this._projectNumber = i;
            }
        }

        if (this._projectNumber === undefined) {
            this._projectNumber = 0;
        }
    };

    /**
     * Request handler for project issues
     * @private
     */
    app._requestHandlerForIssuesAJAX = function (event, ironAJAX) {
        this.$['issue-spinner'].active = true;
    };

    /**
     * Request handler for projects
     * @private
     */
    app._requestHandlerForProjectsAJAX = function (event, ironAJAX) {
        let url = this.jiraURL;

        if (url.length === 0) {
            ironAJAX['request'].abort();
            return;
        }

        this.$['dropdown-for-jira-projects'].placeholder = 'downloading ...';
    };

    /**
     * Handler the response from the AJAX for project issues.
     * @param {Object} event
     * @param {element} ironAJAX
     * @private
     */
    app._responseHandlerForIssuesAJAX = function (event, ironAJAX) {
        let issues = ironAJAX.response.issues;
        let assignees = Object.create(null);
        let filteredAssignees = [];

        // Stop the downloading indication
        this.$['issue-spinner'].active = false;

        // Get unique names
        for (var i = 0; i < issues.length; i++) {
            if (issues[i].fields.assignee) {
                assignees[issues[i].fields.assignee.displayName] = issues[i].fields.assignee.displayName;
            }
        }

        // Create default assignee types
        filteredAssignees = [{name: 'All'}, {name: 'Unassigned'}];

        // Populate the filteredAssignees with the unique assignees names
        Object.keys(assignees).forEach(function (index) {
            filteredAssignees.push({
                name: assignees[index]
            });
        });

        // Create reference for binding
        this._jiraProjectAssignees = filteredAssignees;
    };

    /**
     * Handler the response from the AJAX for JIRA projects
     * @param {Object} event
     * @param {element} ironAJAX
     * @private
     */
    app._responseHandlerForProjectsAJAX = function (event, ironAJAX) {
        let isResponseValid = this._checkAJAXResponseForErrors(ironAJAX);
        let projects;

        if (isResponseValid) {
            projects = ironAJAX.response.views ? ironAJAX.response.views : ironAJAX.response;
        } else {
            this._editedProjects = [];
            return;
        }

        for (let i = 0; i < projects.length; i++) {
            if (projects[i].key) {
                projects[i].value = projects[i].key;
            } else {
                projects[i].value = projects[i].id;
            }
        }

        this._editedProjects = this._sortProjects(projects);

        this._setProjectNameFromConfiguration(this._editedProjects);
    };

    /**
     * Handler the response from the AJAX for project sprints
     * @param {Object} event
     * @param {element} ironAJAX
     * @private
     */
    app._responseHandlerForSprintsAJAX = function (event, ironAJAX) {
        let isResponseValid = this._checkAJAXResponseForErrors(ironAJAX);
        let response;

        if (isResponseValid) {
            response = ironAJAX.response.sprints ? ironAJAX.response.sprints : ironAJAX.response;
        } else {
            this._editedSprints = [];
            return;
        }

        if (response.length === 0) {
            this.showMessage('There are no available sprints in this project.');
            this.$['jira-sprints-dropdown'].placeholder = 'No available sprints ...';
            return;
        }

        this._editedSprints = this._sortSprints(response);

        this.jiraSprint = this._editedSprints[0].id;
        this._getSprintIssues();
    };

    /**
     * Sort JIRA projects alphabetically
     * @param object
     * @private
     */
    app._sortProjects = function (object) {
        let result = object;

        let compareStrings = function (fistKey, secondKey) {
            fistKey = fistKey.toLowerCase();
            secondKey = secondKey.toLowerCase();

            return (fistKey < secondKey) ? -1 : (fistKey > secondKey) ? 1 : 0;
        };

        result.sort(function (fistKey, secondKey) {
            return compareStrings(fistKey.name, secondKey.name);
        });

        return result;
    };

    /**
     * Sort JIRA sprints so the last created will be the first visualized
     * @param {Array} sprints
     * @returns {Array}
     * @private
     */
    app._sortSprints = function (sprints) {
        let result = sprints;

        let compareStrings = function (fistKey, secondKey) {
            fistKey = fistKey.toLowerCase();
            secondKey = secondKey.toLowerCase();

            return fistKey < secondKey ? 1 : -1;
        };

        result.sort(function (fistKey, secondKey) {
            return compareStrings(fistKey.name, secondKey.name);
        });

        return result;
    };
})(document);
