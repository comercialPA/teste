from pathlib import Path
p=Path('cong_el_calafate_android/app/src/main/java/app/congregacion/elcalafate/MainActivity.java')
s=p.read_text(encoding='utf-8')
s=s.replace('import android.widget.LinearLayout;','import android.widget.FrameLayout;\nimport android.widget.LinearLayout;')
anchor='    private LinearLayout externalNav;'
assert anchor in s
s=s.replace(anchor,anchor+'\n    private LinearLayout rescueRail;\n    private boolean rescueRailExpanded=false;',1)
start='webView=new WebView(this); root.addView(webView,new LinearLayout.LayoutParams(-1,0,1f));'
assert start in s
replacement='''FrameLayout pageFrame=new FrameLayout(this);
        webView=new WebView(this);
        pageFrame.addView(webView,new FrameLayout.LayoutParams(-1,-1));
        rescueRail=createRescueRail();
        FrameLayout.LayoutParams floating=new FrameLayout.LayoutParams(dp(46),-2,Gravity.RIGHT|Gravity.CENTER_VERTICAL);
        floating.rightMargin=dp(1);
        pageFrame.addView(rescueRail,floating);
        root.addView(pageFrame,new LinearLayout.LayoutParams(-1,0,1f));'''
s=s.replace(start,replacement,1)
bottom='root.addView(createRescueBar(),new LinearLayout.LayoutParams(-1,dp(49))); '
assert bottom in s
s=s.replace(bottom,'',1)
a=s.index('    private LinearLayout createRescueBar(){')
b=s.index('    private void rescueNavigation(int action){',a)
side='''    private LinearLayout createRescueRail(){
        LinearLayout rail=new LinearLayout(this);rail.setOrientation(LinearLayout.VERTICAL);rail.setGravity(Gravity.CENTER);
        rail.setPadding(dp(3),dp(4),dp(3),dp(4));rail.setElevation(dp(5));
        android.graphics.drawable.GradientDrawable shell=new android.graphics.drawable.GradientDrawable();
        shell.setColor(Color.argb(243,249,253,255));shell.setCornerRadii(new float[]{dp(15),dp(15),dp(4),dp(4),dp(4),dp(4),dp(15),dp(15)});
        shell.setStroke(dp(1),Color.rgb(201,226,242));rail.setBackground(shell);
        String[] labels={"❮","↑","↓","❯","⌂","SOS"};
        String[] hints={"Página anterior","Subir página","Bajar página","Página siguiente","Inicio","Diagnóstico SOS"};
        TextView tab=new TextView(this);tab.setText("◀");tab.setGravity(Gravity.CENTER);tab.setTextColor(Color.rgb(0,123,196));
        tab.setTextSize(18);tab.setTypeface(null,android.graphics.Typeface.BOLD);tab.setContentDescription("Mostrar u ocultar flechas de navegación");
        rail.addView(tab,new LinearLayout.LayoutParams(-1,dp(34)));
        tab.setOnClickListener(v->{rescueRailExpanded=!rescueRailExpanded;
            tab.setText(rescueRailExpanded?"▶":"◀");
            for(int i=1;i<rail.getChildCount();i++)rail.getChildAt(i).setVisibility(rescueRailExpanded?View.VISIBLE:View.GONE);
        });
        for(int i=0;i<labels.length;i++){
            final int which=i;TextView button=new TextView(this);button.setText(labels[i]);button.setGravity(Gravity.CENTER);
            button.setTextColor(Color.rgb(13,70,109));button.setTextSize(i==5?10:20);button.setTypeface(null,android.graphics.Typeface.BOLD);
            button.setContentDescription(hints[i]);
            android.graphics.drawable.GradientDrawable bg=new android.graphics.drawable.GradientDrawable();
            bg.setColor(i==5?Color.rgb(222,243,252):Color.WHITE);
            bg.setCornerRadius(dp(11));bg.setStroke(dp(1),Color.rgb(221,233,242));button.setBackground(bg);
            LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,dp(34));lp.setMargins(0,dp(3),0,0);
            rail.addView(button,lp);button.setVisibility(View.GONE);
            button.setOnClickListener(v->rescueNavigation(which));
        }
        return rail;
    }
'''
s=s[:a]+side+s[b:]
s=s.replace('Versión: 1.7.3 · 27','Versión: 1.7.4 · 28')
s=s.replace('1.7.3\\t27\\t','1.7.4\\t28\\t').replace('1.7.3\\\\t27\\\\t','1.7.4\\\\t28\\\\t')
s=s.replace('CongElCalafate/1.7.2 Android','CongElCalafate/1.7.4 Android')
assert 'createRescueBar' not in s
assert 'createRescueRail' in s and 'pageFrame.addView(rescueRail' in s
p.write_text(s,encoding='utf-8')
print('Native rail lateral V1.7.4 aplicada, navegación inferior de rescate eliminada')
