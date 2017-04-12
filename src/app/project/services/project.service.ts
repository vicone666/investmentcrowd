import { AppConstants } from './../../app.constants';
import { Subject } from 'rxjs/Subject';
import { Link } from './../../core/models/link';
import { Faq } from './../../core/models/faq';
import { Reward } from './../../core/models/reward';
import { Story } from './../../core/models/story';
import { Project } from './../../core/models/project';
import { HttpService } from './../../core/services/http';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class ProjectService {

  public savingDraft = new Subject();

  constructor(private fb: FormBuilder, private http: HttpService) { }

  initProjectForm(project) {
    return this.fb.group({
      'id': [project.id],
      'type': ['project'],
      'title': [project.title, Validators.required],
      'category_id': [project.category_id, Validators.required],
      'image_url': [project.image_url],
      'image_data': ['', Validators.required],
      'video_url': [project.video_url, this.validateURL],
      'goal_amount': [project.goal_amount, Validators.required],
      'funding_model': [project.funding_model || 'flexi', Validators.required],
      'start_date': [project.start_date],
      'duration': [project.duration, Validators.compose([Validators.required, this.validateNumber])]
    });
  }

  initStoryForm(project) {
    let story = project.story;
    if (!story) {
      story = new Story;
    }


    const section_attributes_array = [];
    story.sections.forEach(section => {
      section_attributes_array.push(
        this.fb.group({
          'id': section.id,
          'heading': [section.heading, Validators.required],
          'description': [section.description, Validators.required],
          'image_data': [section.image_data],
          'image_url': [section.image_url]
        })
      );
    });

    return this.fb.group({
      'id': [project.id],
      'type': ['story'],
      'story_attributes': this.fb.group({
        'id': [story.id],
        'sections_attributes': this.fb.array(section_attributes_array)
      })
    });
  }

  initRewardForm(project) {
    let rewards = project.rewards;
    if (!rewards) {
      rewards = [new Reward];
    }

    const reward_attributes_array = [];
    rewards.forEach((reward: any) => {
      reward_attributes_array.push(
        this.fb.group({
          'id': [reward.id],
          'title': [reward.title, Validators.required],
          'description': [reward.description, Validators.required],
          'image_url': [reward.image_url],
          'image_data': [''],
          'amount': [reward.amount, Validators.required],
        })
      );
    });

    return this.fb.group({
      'id': [project.id, Validators.required],
      'type': ['reward', Validators.required],
      'rewards_attributes': this.fb.array(reward_attributes_array)
    });
  }

  initFaqForm(project) {
    let faqs = project.faqs;
    if (!faqs) {
      faqs = [new Faq];
    }

    const faq_attributes_array = [];
    faqs.forEach((faq: any) => {
      faq_attributes_array.push(
        this.fb.group({
          'id': [faq.id],
          'question': [faq.question, Validators.required],
          'answer': [faq.answer, Validators.required]
        })
      );
    });

    return this.fb.group({
      'id': [project.id],
      'type': ['faq'],
      'faqs_attributes': this.fb.array(faq_attributes_array)
    });
  }

  initLinkForm(project) {
    let links = project.links;
    if (!links) {
      links = [new Link];
    }

    const link_attributes_array = [];
    links.forEach((link: any) => {
      link_attributes_array.push(
        this.fb.group({
          'id': [link.id],
          'url': [link.url, Validators.required]
        })
      );
    });

    return this.fb.group({
      'id': [project.id],
      'type': ['link'],
      'links_attributes': this.fb.array(link_attributes_array)
    });
  }

  fetchAllCategories() {
    return this.http.get(
      'api/v1/category'
    ).map(res => {
      return res.json();
    });
  }

  createProject(params) {
    this.savingDraft.next(true);
    return this.http.post(
      'api/v1/projects',
      params
    ).map((res) => {
      this.savingDraft.next(false);
      return res.json();
    });
  }

  fetchProject(id) {
    return this.http.get(
      `/api/v1/projects/${id}`
    ).map((res) => {
      return res.json();
    });
  }

  initDraftProject() {
    return this.http.get(
      `/api/v1/projects/draft`
    ).map((res) => {
      const project = res.json();
      return project;
    });
  }

  // setDraftToLocalStorage(id) {
  //   localStorage.setItem('current_project_id', id);
  // }

  validateNumber(c: FormControl) {
    return c.value > 0 && c.value <= 60 ? null : { validateNumber: true };
  };

  validateURL(c: FormControl) {
    const URL_REGEXP = AppConstants.URL_REGEX;
    return URL_REGEXP.test(c.value) ? null : { validateURL: true };
  }

}
