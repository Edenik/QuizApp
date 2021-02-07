import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { Mode } from 'src/app/core/models/enums.model';
import { Question } from 'src/app/core/models/question.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { QuestionsService } from 'src/app/core/services/questions.service';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.scss'],
})
export class CreateQuestionComponent implements OnInit, OnDestroy {
  private mode: Mode = Mode.create;
  private questionId: number = null;
  private authStatusSub: Subscription;
  form: FormGroup;

  questionOBJ: Question;
  isLoading: boolean = false;

  constructor(
    private questionsService: QuestionsService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  onSaveQuestion() {
    if (this.form.invalid) return;

    this.isLoading = true;
    if (this.mode === Mode.create) {
      this.questionsService.addQuestion(
        this.form.value.question,
        this.form.value.option1,
        this.form.value.option2,
        this.form.value.option3,
        this.form.value.correctAnswer * 1,
        this.form.value.difficulity
      );
    } else {
      this.questionsService.updateQuestion(
        this.questionId,
        this.form.value.question,
        this.form.value.option1,
        this.form.value.option2,
        this.form.value.option3,
        this.form.value.correctAnswer * 1,
        this.form.value.difficulity
      );
    }
    this.form.reset();
  }

  setFormGroup(): void {
    this.form = new FormGroup({
      question: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(150),
        ],
      }),
      option1: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      }),
      option2: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      }),
      option3: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      }),

      correctAnswer: new FormControl(null, {
        validators: [Validators.required, Validators.pattern(/(1|2|3)/)],
      }),

      difficulity: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.pattern(/^easy|medium|high^/),
        ],
      }),
    });
  }

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });

    this.setFormGroup();

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.mode = Mode.edit;
        this.questionId = parseInt(paramMap.get('id'));
        this.isLoading = true;
        this.questionsService
          .getQuestion(this.questionId)
          .subscribe((questionData) => {
            this.isLoading = false;
            const {
              id,
              question,
              option1,
              option2,
              option3,
              difficulity,
              correctAnswer,
            } = questionData.data.question[0];
            this.questionOBJ = {
              id,
              question,
              option1,
              option2,
              option3,
              difficulity,
              correctAnswer,
            };
          });
      } else {
        this.mode = Mode.create;
        this.questionId = null;
      }
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
