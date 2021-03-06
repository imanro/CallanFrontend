import {Component, OnInit, HostListener, ViewChild} from '@angular/core';
import {Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import * as Granim from 'granim';
import * as $ from 'jquery';
import {ActivatedRoute, Router} from '@angular/router';
import {timer as observableTimer} from 'rxjs';

@Component({
    selector: 'app-callan-front-page',
    templateUrl: './front-page.component.html',
    styleUrls: ['./front-page.component.scss']
})
export class CallanFrontPageComponent implements OnInit {

    @ViewChild('navbar') navbar;

    private isHighlightOfCorresponding = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        @Inject(DOCUMENT) private document: Document,
    ) {
    }

    ngOnInit() {
        const granim = new Granim({
            element: '#canvas-basic',
            name: 'basic-gradient',
            direction: 'left-right', // 'diagonal', 'top-bottom', 'radial'
            opacity: [1, 1],
            isPausedWhenNotInView: true,
            states: {
                'default-state': {
                    gradients: [
                        ['#360033', '#0b8793'],
                        ['#33001b', '#ff0084'],
                        ['#1a2a6c', '#b21f1f'],
                        ['#cc2b5e', '#753a88'],
                        ['#ee0979', '#ff6a00']
                    ]
                }
            }
        });

        this.route.fragment.subscribe((fragment: string) => {
            if (fragment && document.getElementById(fragment) != null) {

                this.highlightLink(fragment);

                console.log('nav to', fragment);
                document.getElementById(fragment).scrollIntoView({ behavior: "smooth" });

                // temporary turn off this feature
                this.isHighlightOfCorresponding = false;

                observableTimer(2000).subscribe(() => {
                    this.isHighlightOfCorresponding = true;
                });
            }
        });
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {

        this.modifyNavbarLook();

        if (this.isHighlightOfCorresponding) {
            // highlight by scroll
            this.highlightCorrespondingLink();
        }
    }

    toggleNavbarCollapse() {
        const $navbar = $(this.navbar.nativeElement);
        $navbar.find('.navbar-collapse').toggleClass('show');
    }

    private highlightLink(fragment: string) {
        const $navbar = $(this.navbar.nativeElement);
        $navbar.find('.active').removeClass('active');
        $navbar.find('#' + fragment + '-nav-item').addClass('active');
    }

    private modifyNavbarLook() {
        const scroll = $(window).scrollTop();
        const $navbar = $(this.navbar.nativeElement);

        if (scroll > 100) {
            $navbar.removeClass('navbar-dark').addClass('navbar-light');
            $navbar.find('.navbar-brand img').attr('src', 'assets/img/pages/front/fav.png');
        } else {
            $navbar.removeClass('navbar-light').addClass('navbar-dark');
            $navbar.find('.navbar-brand img').attr('src', 'assets/img/pages/front/logo.png');
        }
    }

    private highlightCorrespondingLink() {
        const scroll = $(window).scrollTop();
        const $navbar = $(this.navbar.nativeElement);

        $navbar.find('a').each((index, el) => {

           const $link = $(el);
           const fragment = $link.attr('fragment');

           if (fragment) {
               const $refEl = $('#' + fragment);

               if ($refEl.position().top <= scroll && $refEl.position().top + $refEl.height() > scroll) {
                   this.highlightLink(fragment);
               }
           }
        });

    }

}
