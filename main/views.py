from django.shortcuts import render
from django.shortcuts import render_to_response
from django.views.generic import TemplateView


def index(request):
    return render_to_response('index.html', {'game_slug': 'penguin'})
# Create your views here.


class Index(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(**kwargs)

        return context
